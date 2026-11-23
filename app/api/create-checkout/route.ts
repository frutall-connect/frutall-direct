import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

interface CheckoutLine {
  productId: string
  name: string
  quantity: number
  unitAmount: number
}

interface CheckoutClaim {
  ok: boolean
  code: string
  attemptId?: string
  snapshot?: CheckoutLine[]
  totalCents?: number
  stripeSessionId?: string | null
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseClaim(value: unknown): CheckoutClaim | null {
  if (!isRecord(value) || typeof value.ok !== 'boolean' || typeof value.code !== 'string') {
    return null
  }

  const stripeSessionId =
    typeof value.stripe_session_id === 'string'
      ? value.stripe_session_id
      : value.stripe_session_id === null || value.stripe_session_id === undefined
        ? null
        : undefined

  if (!value.ok) {
    if (stripeSessionId === undefined) return null
    return {
      ok: false,
      code: value.code,
      stripeSessionId
    }
  }

  if (
    typeof value.attempt_id !== 'string'
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.attempt_id)
    || !Array.isArray(value.snapshot)
    || typeof value.total_cents !== 'number'
    || !Number.isSafeInteger(value.total_cents)
    || value.total_cents <= 0
    || stripeSessionId === undefined
  ) {
    return null
  }

  const snapshot: CheckoutLine[] = []

  for (const item of value.snapshot) {
    if (
      !isRecord(item)
      || typeof item.product_id !== 'string'
      || typeof item.name !== 'string'
      || item.name.trim().length === 0
      || typeof item.quantity !== 'number'
      || !Number.isSafeInteger(item.quantity)
      || item.quantity <= 0
      || typeof item.unit_amount !== 'number'
      || !Number.isSafeInteger(item.unit_amount)
      || item.unit_amount <= 0
    ) {
      return null
    }

    snapshot.push({
      productId: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unitAmount: item.unit_amount
    })
  }

  const snapshotTotal = snapshot.reduce(
    (total, item) => total + item.quantity * item.unitAmount,
    0
  )

  if (
    snapshot.length === 0
    || !Number.isSafeInteger(snapshotTotal)
    || snapshotTotal !== value.total_cents
  ) {
    return null
  }

  return {
    ok: true,
    code: value.code,
    attemptId: value.attempt_id,
    snapshot,
    totalCents: value.total_cents,
    stripeSessionId
  }
}

function claimErrorResponse(code: string) {
  switch (code) {
    case 'not_found':
      return errorResponse('Pedido no encontrado', 404)
    case 'empty_order':
      return errorResponse('El pedido no contiene productos', 400)
    case 'invalid_lines':
    case 'invalid_quantity':
    case 'invalid_price':
    case 'invalid_total':
      return errorResponse('El pedido contiene datos no válidos', 409)
    case 'invalid_product':
    case 'insufficient_stock':
      return errorResponse('El pedido contiene productos no disponibles', 409)
    case 'not_payable':
    case 'session_mismatch':
    case 'stale_attempt':
      return errorResponse('El pedido no está disponible para pago', 409)
    default:
      console.error('Checkout claim failed validation')
      return errorResponse('No se pudo validar el pedido', 500)
  }
}

function matchesClaimDetails(
  session: Stripe.Checkout.Session,
  orderId: string,
  claim: CheckoutClaim
) {
  return (
    session.mode === 'payment'
    && session.amount_total === claim.totalCents
    && session.currency === 'eur'
    && session.metadata?.order_id === orderId
    && session.metadata?.checkout_attempt_id === claim.attemptId
    && session.metadata?.total_cents === String(claim.totalCents)
  )
}

function matchesClaimedSession(
  session: Stripe.Checkout.Session,
  orderId: string,
  claim: CheckoutClaim
) {
  return (
    session.status === 'open'
    && session.payment_status === 'unpaid'
    && matchesClaimDetails(session, orderId, claim)
    && Boolean(session.url)
  )
}

export async function POST(request: Request) {
  const accessToken = request.headers
    .get('authorization')
    ?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!accessToken) {
    return errorResponse('Autenticación requerida', 401)
  }

  let requestBody: unknown

  try {
    requestBody = await request.json()
  } catch {
    return errorResponse('Solicitud no válida', 400)
  }

  if (!isRecord(requestBody) || typeof requestBody.pedidoId !== 'string') {
    return errorResponse('Pedido no válido', 400)
  }

  const pedidoId = requestBody.pedidoId

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pedidoId)) {
    return errorResponse('Pedido no válido', 400)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !stripeSecretKey) {
    console.error('Checkout configuration is incomplete')
    return errorResponse('No se pudo iniciar el pago', 500)
  }

  try {
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: authData, error: authError } =
      await authClient.auth.getUser(accessToken)

    if (authError || !authData.user) {
      return errorResponse('Autenticación no válida', 401)
    }

    const user = authData.user
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-04-22.dahlia'
    })

    const requestOrigin = new URL(request.url).origin
    const originHeader = request.headers.get('origin')

    if (originHeader && new URL(originHeader).origin !== requestOrigin) {
      return errorResponse('Origen de solicitud no válido', 403)
    }

    async function claimCheckout(
      expiredSessionId: string | null = null,
      observedAttemptId: string | null = null,
      observedSessionId: string | null = null
    ) {
      const { data, error } = await supabase.rpc('frutall_claim_checkout', {
        p_pedido_id: pedidoId,
        p_user_id: user.id,
        p_expired_session_id: expiredSessionId,
        p_observed_attempt_id: observedAttemptId,
        p_observed_session_id: observedSessionId
      })

      if (error) {
        console.error('Checkout claim RPC failed')
        return { claim: null, error: true }
      }

      const claim = parseClaim(data)

      if (!claim) {
        console.error('Checkout claim RPC returned an invalid response')
        return { claim: null, error: true }
      }

      return { claim, error: false }
    }

    async function expireOpenSession(session: Stripe.Checkout.Session) {
      if (session.status === 'expired' && session.payment_status !== 'paid') {
        return true
      }

      if (session.status !== 'open' || session.payment_status === 'paid') {
        return false
      }

      const expired = await stripe.checkout.sessions.expire(session.id)
      return expired.status === 'expired' && expired.payment_status !== 'paid'
    }

    let claimResult = await claimCheckout()

    if (claimResult.error || !claimResult.claim) {
      return errorResponse('No se pudo validar el pedido', 500)
    }

    let claim = claimResult.claim

    if (!claim.ok && claim.code !== 'legacy_session') {
      return claimErrorResponse(claim.code)
    }

    if (!claim.ok || claim.stripeSessionId) {
      const existingSessionId = claim.stripeSessionId

      if (!existingSessionId) {
        return claimErrorResponse(claim.code)
      }

      const existingSession =
        await stripe.checkout.sessions.retrieve(existingSessionId)

      if (existingSession.metadata?.order_id !== pedidoId) {
        return errorResponse('El pago existente debe verificarse antes de continuar', 409)
      }

      if (
        claim.ok
        && matchesClaimedSession(existingSession, pedidoId, claim)
      ) {
        return NextResponse.json({ url: existingSession.url })
      }

      const expired = await expireOpenSession(existingSession)

      if (!expired) {
        return errorResponse('El pago existente debe finalizarse antes de continuar', 409)
      }

      claimResult = await claimCheckout(
        existingSessionId,
        claim.attemptId ?? null,
        existingSessionId
      )

      if (claimResult.error || !claimResult.claim) {
        return errorResponse('No se pudo recuperar el pedido', 500)
      }

      claim = claimResult.claim

      if (!claim.ok) {
        return claimErrorResponse(claim.code)
      }
    }

    if (!claim.ok || !claim.attemptId || !claim.snapshot || !claim.totalCents) {
      console.error('Checkout claim did not provide a complete snapshot')
      return errorResponse('No se pudo validar el pedido', 500)
    }

    type CheckoutLineItem =
      NonNullable<
        NonNullable<
          Parameters<typeof stripe.checkout.sessions.create>[0]
        >['line_items']
      >[number]

    function toLineItems(snapshot: CheckoutLine[]): CheckoutLineItem[] {
      return snapshot.map((line) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: line.name
          },
          unit_amount: line.unitAmount
        },
        quantity: line.quantity
      }))
    }

    async function verifiedSessionUrl(sessionId: string, currentClaim: CheckoutClaim) {
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (!matchesClaimedSession(session, pedidoId, currentClaim)) {
        console.error('Checkout session is no longer valid')
        return null
      }

      return session.url
    }

    async function retryAfterExpiration(
      sessionId: string,
      currentClaim: CheckoutClaim,
      isRetry: boolean
    ): Promise<string | null> {
      if (isRetry || !currentClaim.attemptId) {
        return null
      }

      const retryClaimResult = await claimCheckout(
        sessionId,
        currentClaim.attemptId,
        currentClaim.stripeSessionId ?? null
      )

      if (
        retryClaimResult.error
        || !retryClaimResult.claim?.ok
        || !retryClaimResult.claim.attemptId
        || !retryClaimResult.claim.snapshot
        || !retryClaimResult.claim.totalCents
      ) {
        return null
      }

      return createAndAssociate(
        retryClaimResult.claim,
        toLineItems(retryClaimResult.claim.snapshot),
        true
      )
    }

    async function createAndAssociate(
      currentClaim: CheckoutClaim,
      currentLineItems: CheckoutLineItem[],
      isRetry: boolean
    ): Promise<string | null> {
      if (!currentClaim.attemptId || !currentClaim.totalCents) {
        return null
      }

      const createdSession = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: currentLineItems,
          mode: 'payment',
          success_url: new URL('/pedido-exito', requestOrigin).toString(),
          cancel_url: new URL('/carrito', requestOrigin).toString(),
          metadata: {
            order_id: pedidoId,
            checkout_attempt_id: currentClaim.attemptId,
            total_cents: String(currentClaim.totalCents)
          }
        },
        { idempotencyKey: `frutall-checkout-${currentClaim.attemptId}` }
      )

      const session = await stripe.checkout.sessions.retrieve(createdSession.id)

      if (!matchesClaimedSession(session, pedidoId, currentClaim)) {
        if (
          session.status === 'expired'
          && session.payment_status === 'unpaid'
          && matchesClaimDetails(session, pedidoId, currentClaim)
        ) {
          return retryAfterExpiration(session.id, currentClaim, isRetry)
        }

        console.error('Checkout session does not match the active attempt')
        return null
      }

      const { data: finalized, error: finalizeError } = await supabase.rpc(
        'frutall_complete_checkout',
        {
          p_pedido_id: pedidoId,
          p_user_id: user.id,
          p_attempt_id: currentClaim.attemptId,
          p_session_id: session.id
        }
      )

      const explicitlyFinalized =
        !finalizeError
        && isRecord(finalized)
        && finalized.ok === true
        && finalized.code === 'associated'

      if (explicitlyFinalized) {
        return verifiedSessionUrl(session.id, currentClaim)
      }

      const { data: association, error: associationError } = await supabase
        .from('pedidos')
        .select('stripe_session_id, checkout_attempt_id')
        .eq('id', pedidoId)
        .eq('usuario_id', user.id)
        .maybeSingle()

      if (associationError) {
        console.error('Checkout association verification failed')
        return null
      }

      if (
        association?.stripe_session_id === session.id
        && association.checkout_attempt_id === currentClaim.attemptId
      ) {
        const { data: retried, error: retryError } = await supabase.rpc(
          'frutall_complete_checkout',
          {
            p_pedido_id: pedidoId,
            p_user_id: user.id,
            p_attempt_id: currentClaim.attemptId,
            p_session_id: session.id
          }
        )

        if (
          !retryError
          && isRecord(retried)
          && retried.ok === true
          && retried.code === 'associated'
        ) {
          return verifiedSessionUrl(session.id, currentClaim)
        }

        return null
      }

      if (
        association?.checkout_attempt_id === currentClaim.attemptId
        && association.stripe_session_id === null
      ) {
        return null
      }

      const expired = await expireOpenSession(session)

      if (!expired) {
        return null
      }

      return retryAfterExpiration(session.id, currentClaim, isRetry)
    }

    const lineItems = toLineItems(claim.snapshot)

    const checkoutUrl = await createAndAssociate(claim, lineItems, false)

    if (!checkoutUrl) {
      console.error('Checkout session could not be associated')
      return errorResponse('No se pudo completar el inicio del pago', 502)
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch {
    console.error('Checkout creation failed')
    return errorResponse('No se pudo iniciar el pago', 500)
  }
}
