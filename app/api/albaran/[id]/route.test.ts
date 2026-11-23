import { Readable } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const maybeSingle = vi.fn()
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  return {
    createClient: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    renderToStream: vi.fn(),
    from,
    select,
    eq,
    maybeSingle
  }
})

vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createClient }))
vi.mock('@react-pdf/renderer', () => ({ renderToStream: mocks.renderToStream }))
vi.mock('@/components/pdf/AlbaranPDF', () => ({ default: () => null }))
vi.mock('@/lib/supabaseClient', () => ({
  supabase: { auth: { getSession: mocks.getSession } }
}))

import { GET } from './route'
import { generarAlbaran } from '../../../../lib/generarAlbaran'

const context = { params: Promise.resolve({ id: 'pedido-1' }) }

function request(token?: string) {
  return new Request('http://localhost/api/albaran/pedido-1', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.invalid')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key')
  mocks.createClient.mockImplementation((_url, key) =>
    key === 'anon-key'
      ? { auth: { getUser: mocks.getUser } }
      : { from: mocks.from }
  )
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'usuario-1' } }, error: null })
  mocks.maybeSingle.mockResolvedValue({
    data: { id: 'pedido-1', usuario_id: 'usuario-1', lineas_pedido: [] },
    error: null
  })
  mocks.renderToStream.mockImplementation(async () => Readable.from([Buffer.from('%PDF')]))
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('GET albarán', () => {
  it('exige una sesión válida antes de consultar', async () => {
    expect((await GET(request(), context)).status).toBe(401)
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { status: 401 } })
    expect((await GET(request('invalid'), context)).status).toBe(401)
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('distingue errores de autenticación, consulta y pedido inexistente', async () => {
    mocks.getUser.mockResolvedValueOnce({ data: { user: null }, error: { status: 503 } })
    expect((await GET(request('token'), context)).status).toBe(503)

    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'query failed' } })
    const queryError = await GET(request('token'), context)
    expect(queryError.status).toBe(500)
    expect(await queryError.json()).toEqual({ error: 'No se pudo consultar el pedido' })

    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    expect((await GET(request('token'), context)).status).toBe(404)
  })

  it('deniega un pedido ajeno incluso a un usuario con rol de administrador', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'usuario-2', app_metadata: { rol: 'admin' } } },
      error: null
    })
    const response = await GET(request('token'), context)
    expect(response.status).toBe(403)
    expect(mocks.renderToStream).not.toHaveBeenCalled()
  })

  it('genera el PDF solo para el propietario', async () => {
    const response = await GET(request('token'), context)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/pdf')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('content-disposition')).toBe('inline; filename="albaran-pedido-1.pdf"')
    expect(await response.text()).toBe('%PDF')
    expect(mocks.eq).toHaveBeenCalledWith('id', 'pedido-1')
    expect(mocks.getUser).toHaveBeenCalledWith('token')
  })
})

describe('botón de albarán', () => {
  it('envía el token en la cabecera y abre el PDF', async () => {
    const replace = vi.fn()
    const close = vi.fn()
    const open = vi.fn(() => ({ location: { replace }, close }))
    const fetchMock = vi.fn().mockResolvedValue(new Response('%PDF', {
      headers: { 'Content-Type': 'application/pdf' }
    }))
    vi.stubGlobal('window', { open })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('alert', vi.fn())
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:pdf')
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'token' } }, error: null })

    await generarAlbaran({ id: 'pedido-1' })

    expect(fetchMock).toHaveBeenCalledWith('/api/albaran/pedido-1', {
      headers: { Authorization: 'Bearer token' },
      cache: 'no-store'
    })
    expect(replace).toHaveBeenCalledWith('blob:pdf')
    expect(close).not.toHaveBeenCalled()
  })

  it('cierra la ventana y muestra el error cuando no hay autorización', async () => {
    const close = vi.fn()
    const alertMock = vi.fn()
    vi.stubGlobal('window', { open: vi.fn(() => ({ location: { replace: vi.fn() }, close })) })
    vi.stubGlobal('alert', alertMock)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'Sin permiso' }, { status: 403 })))
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'token' } }, error: null })

    await generarAlbaran({ id: 'pedido-1' })

    expect(close).toHaveBeenCalled()
    expect(alertMock).toHaveBeenCalledWith('Sin permiso')
  })
})
