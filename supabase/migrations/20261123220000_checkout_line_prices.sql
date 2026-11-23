BEGIN;

DO $preflight$
DECLARE
  v_owner oid;
BEGIN
  SELECT p.proowner
  INTO v_owner
  FROM pg_catalog.pg_proc AS p
  WHERE p.oid = pg_catalog.to_regprocedure(
    'public.frutall_claim_checkout(uuid,uuid,text,uuid,text)'
  );

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Checkout price synchronization requires the existing checkout claim function';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles AS r
    WHERE r.oid = v_owner AND (r.rolsuper OR r.rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'Checkout claim owner requires BYPASSRLS or SUPERUSER';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', '152ac28ea411225e8ba1d9584ec54ab3'),
      ('public.frutall_guard_checkout_line_mutation()', '82607dc2e300a0071af51ad3cf15d9a5'),
      ('public.frutall_guard_checkout_metadata()', '1d11b026671d5b5c30ca931c0787a821')
    ) AS expected(signature, source_hash)
    LEFT JOIN pg_catalog.pg_proc AS p
      ON p.oid = pg_catalog.to_regprocedure(expected.signature)
    WHERE p.oid IS NULL
      OR pg_catalog.md5(pg_catalog.replace(p.prosrc, E'\r\n', E'\n')) <> expected.source_hash
  ) THEN
    RAISE EXCEPTION 'Checkout functions differ from the expected previous migration';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS p
    JOIN pg_catalog.pg_roles AS r ON r.oid = p.proowner
    WHERE p.oid = pg_catalog.to_regprocedure('public.frutall_guard_checkout_line_mutation()')
      AND p.prosecdef
      AND (r.rolsuper OR r.rolbypassrls)
      AND 'row_security=off' = ANY(p.proconfig)
  ) OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS p
    WHERE p.oid = pg_catalog.to_regprocedure('public.frutall_guard_checkout_metadata()')
      AND p.prosecdef
  ) THEN
    RAISE EXCEPTION 'Checkout guard function security settings are incompatible';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('public.pedidos', 'frutall_guard_checkout_metadata', 'public.frutall_guard_checkout_metadata()', 21, NULL, NULL),
      ('public.lineas_pedido', 'frutall_lock_checkout_line_mutations', 'public.frutall_guard_checkout_line_mutation()', 30, NULL, NULL),
      ('public.lineas_pedido', 'frutall_guard_checkout_line_insert', 'public.frutall_guard_checkout_line_mutation()', 4, NULL, 'new_rows'),
      ('public.lineas_pedido', 'frutall_guard_checkout_line_update', 'public.frutall_guard_checkout_line_mutation()', 16, 'old_rows', 'new_rows'),
      ('public.lineas_pedido', 'frutall_guard_checkout_line_delete', 'public.frutall_guard_checkout_line_mutation()', 8, 'old_rows', NULL)
    ) AS expected(table_name, trigger_name, function_signature, trigger_type, old_table, new_table)
    LEFT JOIN pg_catalog.pg_trigger AS t
      ON t.tgrelid = pg_catalog.to_regclass(expected.table_name)
      AND t.tgname = expected.trigger_name
    WHERE t.oid IS NULL
      OR t.tgfoid IS DISTINCT FROM pg_catalog.to_regprocedure(expected.function_signature)::oid
      OR t.tgtype IS DISTINCT FROM expected.trigger_type
      OR t.tgoldtable IS DISTINCT FROM expected.old_table
      OR t.tgnewtable IS DISTINCT FROM expected.new_table
      OR t.tgenabled NOT IN ('O', 'A')
  ) THEN
    RAISE EXCEPTION 'Checkout line or metadata guards do not match the previous migration';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS t
    WHERE NOT t.tgisinternal
      AND t.tgenabled IN ('O', 'A')
      AND (t.tgtype & 16) <> 0
      AND (
        (t.tgrelid = 'public.pedidos'::pg_catalog.regclass
          AND t.tgname <> 'frutall_guard_checkout_metadata')
        OR
        (t.tgrelid = 'public.lineas_pedido'::pg_catalog.regclass
          AND t.tgname NOT IN (
            'frutall_lock_checkout_line_mutations',
            'frutall_guard_checkout_line_update'
          ))
      )
  ) THEN
    RAISE EXCEPTION 'Additional enabled UPDATE triggers on checkout tables require manual review';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES ('precio'), ('subtotal')) AS required(column_name)
    LEFT JOIN information_schema.columns AS col
      ON col.table_schema = 'public'
      AND col.table_name = 'lineas_pedido'
      AND col.column_name = required.column_name
    WHERE col.data_type IS DISTINCT FROM 'numeric'
      OR col.numeric_precision IS DISTINCT FROM 10
      OR col.numeric_scale IS DISTINCT FROM 2
  ) THEN
    RAISE EXCEPTION 'Checkout price synchronization requires numeric(10,2) line prices and subtotals';
  END IF;

  IF NOT pg_catalog.has_column_privilege(v_owner, 'public.lineas_pedido', 'precio', 'SELECT')
    OR NOT pg_catalog.has_column_privilege(v_owner, 'public.lineas_pedido', 'precio', 'UPDATE')
    OR NOT pg_catalog.has_column_privilege(v_owner, 'public.lineas_pedido', 'subtotal', 'SELECT')
    OR NOT pg_catalog.has_column_privilege(v_owner, 'public.lineas_pedido', 'subtotal', 'UPDATE')
  THEN
    RAISE EXCEPTION 'Checkout claim owner lacks line price or subtotal privileges';
  END IF;
END;
$preflight$;

CREATE FUNCTION public.frutall_sync_checkout_snapshot_prices(
  p_pedido_id uuid,
  p_user_id uuid,
  p_attempt_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
SET row_security = off
AS $function$
DECLARE
  v_pedido public.pedidos%ROWTYPE;
  v_item record;
  v_quantity numeric;
  v_total_cents numeric := 0;
  v_max_line_cents constant numeric := 9999999999;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Checkout price synchronization requires service role';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(1179790676, 1128817492);

  SELECT *
  INTO v_pedido
  FROM public.pedidos
  WHERE id = p_pedido_id
    AND usuario_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND
    OR v_pedido.checkout_attempt_id IS DISTINCT FROM p_attempt_id
    OR p_attempt_id IS NULL
    OR v_pedido.checkout_snapshot IS NULL
    OR pg_catalog.jsonb_typeof(v_pedido.checkout_snapshot) IS DISTINCT FROM 'array'
    OR v_pedido.checkout_total_cents IS NULL
    OR v_pedido.checkout_total_cents <= 0
    OR v_pedido.checkout_started_at IS NULL
  THEN
    RAISE EXCEPTION 'Checkout snapshot is inconsistent';
  END IF;

  IF v_pedido.pagado IS TRUE OR v_pedido.estado = 'pagado' THEN
    RAISE EXCEPTION 'Cannot synchronize checkout lines for a paid order';
  END IF;

  IF pg_catalog.jsonb_array_length(v_pedido.checkout_snapshot) = 0
    OR EXISTS (
      SELECT 1
      FROM pg_catalog.jsonb_array_elements(v_pedido.checkout_snapshot) AS item(value)
      WHERE pg_catalog.jsonb_typeof(item.value) IS DISTINCT FROM 'object'
        OR pg_catalog.jsonb_typeof(item.value->'product_id') IS DISTINCT FROM 'string'
        OR (item.value->>'product_id') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        OR pg_catalog.jsonb_typeof(item.value->'quantity') IS DISTINCT FROM 'number'
        OR (item.value->>'quantity') !~ '^[0-9]+$'
        OR pg_catalog.jsonb_typeof(item.value->'unit_amount') IS DISTINCT FROM 'number'
        OR (item.value->>'unit_amount') !~ '^[0-9]+$'
    )
    OR EXISTS (
      SELECT 1
      FROM pg_catalog.jsonb_array_elements(v_pedido.checkout_snapshot) AS item(value)
      GROUP BY item.value->>'product_id'
      HAVING pg_catalog.count(*) > 1
    )
  THEN
    RAISE EXCEPTION 'Checkout snapshot contains invalid or duplicate products';
  END IF;

  FOR v_item IN
    SELECT item.value->>'product_id' AS product_id,
           (item.value->>'quantity')::numeric AS quantity,
           (item.value->>'unit_amount')::numeric AS unit_cents
    FROM pg_catalog.jsonb_array_elements(v_pedido.checkout_snapshot) AS item(value)
    ORDER BY item.value->>'product_id'
  LOOP
    IF v_item.quantity <= 0 OR v_item.unit_cents <= 0
      OR v_item.unit_cents > v_max_line_cents
    THEN
      RAISE EXCEPTION 'Checkout snapshot price or quantity is outside the line column range';
    END IF;

    SELECT pg_catalog.sum(linea.cantidad::numeric)
    INTO v_quantity
    FROM public.lineas_pedido AS linea
    WHERE linea.pedido_id = p_pedido_id
      AND linea.producto_id::text = v_item.product_id;

    IF v_quantity IS DISTINCT FROM v_item.quantity OR EXISTS (
      SELECT 1
      FROM public.lineas_pedido AS linea
      WHERE linea.pedido_id = p_pedido_id
        AND linea.producto_id::text = v_item.product_id
        AND (
          linea.cantidad IS NULL
          OR linea.cantidad <= 0
          OR linea.cantidad::numeric * v_item.unit_cents > v_max_line_cents
        )
    ) THEN
      RAISE EXCEPTION 'Checkout lines do not match the snapshot or exceed the subtotal range';
    END IF;

    v_total_cents := v_total_cents + v_item.quantity * v_item.unit_cents;
  END LOOP;

  IF v_total_cents IS DISTINCT FROM v_pedido.checkout_total_cents::numeric
    OR v_pedido.total IS DISTINCT FROM v_total_cents / 100
    OR EXISTS (
      SELECT 1
      FROM public.lineas_pedido AS linea
      WHERE linea.pedido_id = p_pedido_id
        AND NOT EXISTS (
          SELECT 1
          FROM pg_catalog.jsonb_array_elements(v_pedido.checkout_snapshot) AS item(value)
          WHERE item.value->>'product_id' = linea.producto_id::text
        )
    )
  THEN
    RAISE EXCEPTION 'Checkout lines or order total do not match the snapshot';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.lineas_pedido AS linea
    JOIN pg_catalog.jsonb_array_elements(v_pedido.checkout_snapshot) AS item(value)
      ON linea.producto_id::text = item.value->>'product_id'
    WHERE linea.pedido_id = p_pedido_id
      AND (
        linea.precio IS DISTINCT FROM (item.value->>'unit_amount')::numeric / 100
        OR linea.subtotal IS DISTINCT FROM linea.cantidad::numeric * (item.value->>'unit_amount')::numeric / 100
      )
  ) THEN
    RETURN;
  END IF;

  -- The advisory lock and row lock remain held until the RPC transaction ends.
  UPDATE public.pedidos
  SET checkout_attempt_id = NULL,
      checkout_snapshot = NULL,
      checkout_total_cents = NULL,
      checkout_started_at = NULL
  WHERE id = p_pedido_id
    AND usuario_id = p_user_id
    AND checkout_attempt_id = p_attempt_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checkout attempt changed during line synchronization';
  END IF;

  UPDATE public.lineas_pedido AS linea
  SET precio = (item.value->>'unit_amount')::numeric / 100,
      subtotal = linea.cantidad::numeric * (item.value->>'unit_amount')::numeric / 100
  FROM pg_catalog.jsonb_array_elements(v_pedido.checkout_snapshot) AS item(value)
  WHERE linea.pedido_id = p_pedido_id
    AND linea.producto_id::text = item.value->>'product_id';

  IF EXISTS (
    SELECT 1
    FROM public.lineas_pedido AS linea
    LEFT JOIN pg_catalog.jsonb_array_elements(v_pedido.checkout_snapshot) AS item(value)
      ON linea.producto_id::text = item.value->>'product_id'
    WHERE linea.pedido_id = p_pedido_id
      AND (
        item.value IS NULL
        OR linea.cantidad IS NULL
        OR linea.cantidad <= 0
        OR linea.precio IS DISTINCT FROM (item.value->>'unit_amount')::numeric / 100
        OR linea.subtotal IS DISTINCT FROM linea.cantidad::numeric * (item.value->>'unit_amount')::numeric / 100
      )
  ) OR EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_array_elements(v_pedido.checkout_snapshot) AS item(value)
    WHERE (item.value->>'quantity')::numeric IS DISTINCT FROM (
      SELECT pg_catalog.sum(linea.cantidad::numeric)
      FROM public.lineas_pedido AS linea
      WHERE linea.pedido_id = p_pedido_id
        AND linea.producto_id::text = item.value->>'product_id'
    )
  ) OR (
    SELECT pg_catalog.sum(linea.subtotal)
    FROM public.lineas_pedido AS linea
    WHERE linea.pedido_id = p_pedido_id
  ) IS DISTINCT FROM v_total_cents / 100
  THEN
    RAISE EXCEPTION 'Checkout line synchronization did not preserve the snapshot';
  END IF;

  UPDATE public.pedidos
  SET checkout_attempt_id = v_pedido.checkout_attempt_id,
      checkout_snapshot = v_pedido.checkout_snapshot,
      checkout_total_cents = v_pedido.checkout_total_cents,
      checkout_started_at = v_pedido.checkout_started_at
  WHERE id = p_pedido_id
    AND usuario_id = p_user_id
    AND checkout_attempt_id IS NULL
    AND checkout_snapshot IS NULL
    AND checkout_total_cents IS NULL
    AND checkout_started_at IS NULL
    AND stripe_session_id IS NOT DISTINCT FROM v_pedido.stripe_session_id
    AND estado IS NOT DISTINCT FROM v_pedido.estado
    AND pagado IS NOT DISTINCT FROM v_pedido.pagado
    AND metodo_pago IS NOT DISTINCT FROM v_pedido.metodo_pago
    AND total IS NOT DISTINCT FROM v_pedido.total;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checkout order changed during line synchronization';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.frutall_sync_checkout_snapshot_prices(uuid, uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;

DO $grant_helper$
DECLARE
  v_owner name;
BEGIN
  SELECT r.rolname
  INTO v_owner
  FROM pg_catalog.pg_proc AS p
  JOIN pg_catalog.pg_roles AS r ON r.oid = p.proowner
  WHERE p.oid = pg_catalog.to_regprocedure(
    'public.frutall_claim_checkout(uuid,uuid,text,uuid,text)'
  );

  EXECUTE pg_catalog.format(
    'GRANT EXECUTE ON FUNCTION public.frutall_sync_checkout_snapshot_prices(uuid,uuid,uuid) TO %I',
    v_owner
  );
END;
$grant_helper$;

CREATE OR REPLACE FUNCTION public.frutall_claim_checkout(
  p_pedido_id uuid,
  p_user_id uuid,
  p_expired_session_id text,
  p_observed_attempt_id uuid,
  p_observed_session_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $function$
DECLARE
  v_pedido public.pedidos%ROWTYPE;
  v_line record;
  v_attempt_id uuid;
  v_snapshot jsonb := '[]'::jsonb;
  v_line_count bigint;
  v_processed_count bigint := 0;
  v_quantity numeric;
  v_price numeric;
  v_unit_cents numeric;
  v_line_cents numeric;
  v_total_cents numeric := 0;
  v_max_safe_integer constant numeric := 9007199254740991;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role'
    OR p_pedido_id IS NULL
    OR p_user_id IS NULL
  THEN
    RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'not_authorized');
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(1179790676, 1128817492);

  SELECT *
  INTO v_pedido
  FROM public.pedidos
  WHERE id = p_pedido_id
    AND usuario_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;

  IF v_pedido.pagado IS TRUE
    OR v_pedido.estado IS DISTINCT FROM 'pendiente'
    OR v_pedido.metodo_pago IS DISTINCT FROM 'tarjeta'
  THEN
    RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'not_payable');
  END IF;

  IF p_expired_session_id IS NOT NULL THEN
    IF p_expired_session_id = ''
      OR v_pedido.checkout_attempt_id IS DISTINCT FROM p_observed_attempt_id
      OR v_pedido.stripe_session_id::text IS DISTINCT FROM p_observed_session_id
      OR (p_observed_session_id IS NOT NULL AND p_observed_session_id <> p_expired_session_id)
      OR (p_observed_attempt_id IS NULL AND p_observed_session_id IS NULL)
    THEN
      RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'session_mismatch');
    END IF;
  ELSIF v_pedido.checkout_attempt_id IS NOT NULL THEN
    IF v_pedido.checkout_snapshot IS NULL
      OR pg_catalog.jsonb_typeof(v_pedido.checkout_snapshot) IS DISTINCT FROM 'array'
      OR v_pedido.checkout_total_cents IS NULL
      OR v_pedido.checkout_started_at IS NULL
    THEN
      RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'inconsistent');
    END IF;

    IF v_pedido.stripe_session_id IS NULL
      AND v_pedido.checkout_started_at < pg_catalog.now() - INTERVAL '23 hours'
    THEN
      RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'stale_attempt');
    END IF;

    PERFORM public.frutall_sync_checkout_snapshot_prices(
      p_pedido_id, p_user_id, v_pedido.checkout_attempt_id
    );

    RETURN pg_catalog.jsonb_build_object(
      'ok', true,
      'code', 'claimed',
      'attempt_id', v_pedido.checkout_attempt_id,
      'snapshot', v_pedido.checkout_snapshot,
      'total_cents', v_pedido.checkout_total_cents,
      'stripe_session_id', v_pedido.stripe_session_id
    );
  ELSIF v_pedido.stripe_session_id IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'ok', false,
      'code', 'legacy_session',
      'stripe_session_id', v_pedido.stripe_session_id
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.lineas_pedido
    WHERE pedido_id = p_pedido_id
      AND (
        producto_id IS NULL
        OR cantidad IS NULL
        OR cantidad <= 0
        OR cantidad <> pg_catalog.trunc(cantidad::numeric)
        OR cantidad > 9007199254740991
      )
  ) THEN
    RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'invalid_lines');
  END IF;

  SELECT pg_catalog.count(*)
  INTO v_line_count
  FROM (
    SELECT producto_id
    FROM public.lineas_pedido
    WHERE pedido_id = p_pedido_id
    GROUP BY producto_id
  ) AS requested;

  IF v_line_count = 0 THEN
    RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'empty_order');
  END IF;

  FOR v_line IN
    SELECT requested.producto_id,
           requested.cantidad,
           product.nombre::text AS nombre,
           product.precio::numeric AS precio,
           product.disponible AS disponible
    FROM (
      SELECT producto_id, pg_catalog.sum(cantidad::numeric) AS cantidad
      FROM public.lineas_pedido
      WHERE pedido_id = p_pedido_id
      GROUP BY producto_id
    ) AS requested
    JOIN public.productos AS product
      ON product.id = requested.producto_id
    ORDER BY requested.producto_id
  LOOP
    v_quantity := v_line.cantidad;
    v_price := v_line.precio;

    IF v_quantity IS NULL
      OR v_quantity <= 0
      OR v_quantity <> pg_catalog.trunc(v_quantity)
      OR v_quantity > v_max_safe_integer
    THEN
      RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'invalid_quantity');
    END IF;

    IF v_line.disponible IS DISTINCT FROM TRUE THEN
      RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'invalid_product');
    END IF;

    IF v_line.nombre IS NULL
      OR pg_catalog.btrim(v_line.nombre) = ''
      OR v_price IS NULL
      OR v_price <= 0
      OR v_price >= 90071992547409.91
    THEN
      RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'invalid_product');
    END IF;

    v_unit_cents := pg_catalog.round(v_price * 100);

    IF v_unit_cents <= 0 OR v_unit_cents > v_max_safe_integer THEN
      RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'invalid_price');
    END IF;

    v_line_cents := v_unit_cents * v_quantity;

    IF v_line_cents <= 0
      OR v_line_cents > v_max_safe_integer - v_total_cents
    THEN
      RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'invalid_total');
    END IF;

    v_total_cents := v_total_cents + v_line_cents;
    v_processed_count := v_processed_count + 1;
    v_snapshot := v_snapshot || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'product_id', v_line.producto_id,
        'name', v_line.nombre,
        'quantity', v_quantity::bigint,
        'unit_amount', v_unit_cents::bigint
      )
    );
  END LOOP;

  IF v_processed_count <> v_line_count OR v_total_cents <= 0 THEN
    RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'invalid_product');
  END IF;

  v_attempt_id := pg_catalog.gen_random_uuid();

  UPDATE public.pedidos AS pedido
  SET stripe_session_id = NULL,
      checkout_attempt_id = v_attempt_id,
      checkout_snapshot = v_snapshot,
      checkout_total_cents = v_total_cents::bigint,
      checkout_started_at = pg_catalog.now(),
      total = v_total_cents / 100
  WHERE pedido.id = p_pedido_id
    AND pedido.usuario_id = p_user_id
  RETURNING * INTO v_pedido;

  PERFORM public.frutall_sync_checkout_snapshot_prices(
    p_pedido_id, p_user_id, v_attempt_id
  );

  RETURN pg_catalog.jsonb_build_object(
    'ok', true,
    'code', 'claimed',
    'attempt_id', v_attempt_id,
    'snapshot', v_snapshot,
    'total_cents', v_total_cents::bigint,
    'stripe_session_id', v_pedido.stripe_session_id
  );
END;
$function$;

COMMIT;
