BEGIN;

DO $preflight$
DECLARE
  v_data_type text;
BEGIN
  SELECT data_type
  INTO v_data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'pedidos'
    AND column_name = 'total';

  IF v_data_type IS DISTINCT FROM 'numeric' THEN
    RAISE EXCEPTION 'Checkout lock requires public.pedidos.total to use numeric';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('lineas_pedido', 'cantidad', 'integer'),
      ('productos', 'precio', 'numeric'),
      ('productos', 'disponible', 'boolean')
    ) AS required_columns(table_name, column_name, data_type)
    LEFT JOIN information_schema.columns AS existing_column
      ON existing_column.table_schema = 'public'
      AND existing_column.table_name = required_columns.table_name
      AND existing_column.column_name = required_columns.column_name
    WHERE existing_column.data_type IS DISTINCT FROM required_columns.data_type
  ) THEN
    RAISE EXCEPTION 'Checkout lock requires integer quantity, numeric price, and boolean availability columns';
  END IF;
END;
$preflight$;

ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS checkout_attempt_id uuid,
  ADD COLUMN IF NOT EXISTS checkout_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS checkout_total_cents bigint,
  ADD COLUMN IF NOT EXISTS checkout_started_at timestamptz,
  ADD COLUMN checkout_lineas_version boolean NOT NULL DEFAULT false;

ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_checkout_snapshot_consistent
  CHECK (
    (
      checkout_attempt_id IS NULL
      AND checkout_snapshot IS NULL
      AND checkout_total_cents IS NULL
      AND checkout_started_at IS NULL
    )
    OR
    (
      checkout_attempt_id IS NOT NULL
      AND checkout_snapshot IS NOT NULL
      AND jsonb_typeof(checkout_snapshot) = 'array'
      AND checkout_total_cents IS NOT NULL
      AND checkout_total_cents > 0
      AND checkout_started_at IS NOT NULL
    )
  );

CREATE OR REPLACE FUNCTION public.frutall_guard_checkout_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF CURRENT_USER IN ('anon', 'authenticated')
    OR COALESCE(auth.role(), '') IN ('anon', 'authenticated')
  THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.checkout_attempt_id IS NOT NULL
        OR NEW.checkout_snapshot IS NOT NULL
        OR NEW.checkout_total_cents IS NOT NULL
        OR NEW.checkout_started_at IS NOT NULL
      THEN
        RAISE EXCEPTION USING
          ERRCODE = '42501',
          MESSAGE = 'No se permite modificar los datos del checkout';
      END IF;
    ELSE
      IF NEW.checkout_attempt_id IS DISTINCT FROM OLD.checkout_attempt_id
        OR NEW.checkout_snapshot IS DISTINCT FROM OLD.checkout_snapshot
        OR NEW.checkout_total_cents IS DISTINCT FROM OLD.checkout_total_cents
        OR NEW.checkout_started_at IS DISTINCT FROM OLD.checkout_started_at
      THEN
        RAISE EXCEPTION USING
          ERRCODE = '42501',
          MESSAGE = 'No se permite modificar los datos del checkout';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER frutall_guard_checkout_metadata
AFTER INSERT OR UPDATE
ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.frutall_guard_checkout_metadata();

REVOKE ALL ON FUNCTION public.frutall_guard_checkout_metadata()
  FROM PUBLIC, anon, authenticated, service_role;

DROP FUNCTION IF EXISTS public.frutall_claim_checkout(uuid, uuid, text);

CREATE FUNCTION public.frutall_claim_checkout(
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

REVOKE ALL ON FUNCTION public.frutall_claim_checkout(uuid, uuid, text, uuid, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.frutall_claim_checkout(uuid, uuid, text, uuid, text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.frutall_complete_checkout(
  p_pedido_id uuid,
  p_user_id uuid,
  p_attempt_id uuid,
  p_session_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $function$
DECLARE
  v_session_id text;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role'
    OR p_pedido_id IS NULL
    OR p_user_id IS NULL
    OR p_attempt_id IS NULL
    OR p_session_id IS NULL
    OR p_session_id = ''
  THEN
    RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'not_authorized');
  END IF;

  UPDATE public.pedidos
  SET stripe_session_id = p_session_id
  WHERE id = p_pedido_id
    AND usuario_id = p_user_id
    AND estado = 'pendiente'
    AND metodo_pago = 'tarjeta'
    AND pagado IS NOT TRUE
    AND checkout_attempt_id = p_attempt_id
    AND checkout_snapshot IS NOT NULL
    AND checkout_total_cents > 0
    AND (stripe_session_id IS NULL OR stripe_session_id = p_session_id)
  RETURNING stripe_session_id INTO v_session_id;

  IF FOUND AND v_session_id = p_session_id THEN
    RETURN pg_catalog.jsonb_build_object('ok', true, 'code', 'associated');
  END IF;

  RETURN pg_catalog.jsonb_build_object('ok', false, 'code', 'association_conflict');
END;
$function$;

REVOKE ALL ON FUNCTION public.frutall_complete_checkout(uuid, uuid, uuid, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.frutall_complete_checkout(uuid, uuid, uuid, text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.frutall_guard_checkout_line_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $function$
DECLARE
  v_pedido_id uuid;
  v_checkout_attempt_id uuid;
BEGIN
  IF TG_WHEN = 'BEFORE' THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(1179790676, 1128817492);
    RETURN NULL;
  END IF;

  IF TG_OP = 'INSERT' THEN
    FOR v_pedido_id IN
      SELECT DISTINCT pedido_id
      FROM new_rows
      WHERE pedido_id IS NOT NULL
      ORDER BY pedido_id
    LOOP
      SELECT checkout_attempt_id
      INTO v_checkout_attempt_id
      FROM public.pedidos
      WHERE id = v_pedido_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION USING
          ERRCODE = '23503',
          MESSAGE = 'Pedido asociado no encontrado';
      END IF;

      IF v_checkout_attempt_id IS NOT NULL THEN
        RAISE EXCEPTION USING
          ERRCODE = '55000',
          MESSAGE = 'Las líneas del pedido están bloqueadas durante el checkout';
      END IF;

      UPDATE public.pedidos
      SET checkout_lineas_version = NOT checkout_lineas_version
      WHERE id = v_pedido_id;
    END LOOP;
  ELSIF TG_OP = 'DELETE' THEN
    FOR v_pedido_id IN
      SELECT DISTINCT pedido_id
      FROM old_rows
      WHERE pedido_id IS NOT NULL
      ORDER BY pedido_id
    LOOP
      SELECT checkout_attempt_id
      INTO v_checkout_attempt_id
      FROM public.pedidos
      WHERE id = v_pedido_id
      FOR UPDATE;

      IF NOT FOUND THEN
        CONTINUE;
      END IF;

      IF v_checkout_attempt_id IS NOT NULL THEN
        RAISE EXCEPTION USING
          ERRCODE = '55000',
          MESSAGE = 'Las líneas del pedido están bloqueadas durante el checkout';
      END IF;

      UPDATE public.pedidos
      SET checkout_lineas_version = NOT checkout_lineas_version
      WHERE id = v_pedido_id;
    END LOOP;
  ELSE
    FOR v_pedido_id IN
      SELECT pedido_id
      FROM (
        SELECT pedido_id FROM old_rows
        UNION
        SELECT pedido_id FROM new_rows
      ) AS affected_orders
      WHERE pedido_id IS NOT NULL
      ORDER BY pedido_id
    LOOP
      SELECT checkout_attempt_id
      INTO v_checkout_attempt_id
      FROM public.pedidos
      WHERE id = v_pedido_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION USING
          ERRCODE = '23503',
          MESSAGE = 'Pedido asociado no encontrado';
      END IF;

      IF v_checkout_attempt_id IS NOT NULL THEN
        RAISE EXCEPTION USING
          ERRCODE = '55000',
          MESSAGE = 'Las líneas del pedido están bloqueadas durante el checkout';
      END IF;

      UPDATE public.pedidos
      SET checkout_lineas_version = NOT checkout_lineas_version
      WHERE id = v_pedido_id;
    END LOOP;
  END IF;

  RETURN NULL;
END;
$function$;

REVOKE ALL ON FUNCTION public.frutall_guard_checkout_line_mutation()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER frutall_lock_checkout_line_mutations
BEFORE INSERT OR UPDATE OR DELETE
ON public.lineas_pedido
FOR EACH STATEMENT
EXECUTE FUNCTION public.frutall_guard_checkout_line_mutation();

CREATE TRIGGER frutall_guard_checkout_line_insert
AFTER INSERT
ON public.lineas_pedido
REFERENCING NEW TABLE AS new_rows
FOR EACH STATEMENT
EXECUTE FUNCTION public.frutall_guard_checkout_line_mutation();

CREATE TRIGGER frutall_guard_checkout_line_update
AFTER UPDATE
ON public.lineas_pedido
REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows
FOR EACH STATEMENT
EXECUTE FUNCTION public.frutall_guard_checkout_line_mutation();

CREATE TRIGGER frutall_guard_checkout_line_delete
AFTER DELETE
ON public.lineas_pedido
REFERENCING OLD TABLE AS old_rows
FOR EACH STATEMENT
EXECUTE FUNCTION public.frutall_guard_checkout_line_mutation();

CREATE OR REPLACE FUNCTION public.frutall_guard_checkout_order_delete()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF TG_LEVEL = 'STATEMENT' THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(1179790676, 1128817492);
    RETURN NULL;
  END IF;

  IF OLD.checkout_attempt_id IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'No se puede eliminar un pedido con checkout activo';
  END IF;

  RETURN OLD;
END;
$function$;

REVOKE ALL ON FUNCTION public.frutall_guard_checkout_order_delete()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER frutall_lock_checkout_order_delete
BEFORE DELETE
ON public.pedidos
FOR EACH STATEMENT
EXECUTE FUNCTION public.frutall_guard_checkout_order_delete();

CREATE TRIGGER frutall_block_active_checkout_order_delete
BEFORE DELETE
ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.frutall_guard_checkout_order_delete();

CREATE OR REPLACE FUNCTION public.frutall_block_checkout_line_truncate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'No se permite truncar las líneas de pedido';
END;
$function$;

CREATE TRIGGER frutall_block_checkout_line_truncate
BEFORE TRUNCATE
ON public.lineas_pedido
FOR EACH STATEMENT
EXECUTE FUNCTION public.frutall_block_checkout_line_truncate();

DO $checkout_privileges$
DECLARE
  v_function record;
  v_requirement record;
  v_schema oid;
  v_table oid;
  v_helper oid;
  v_attnum smallint;
  v_service_role oid;
  v_public_schema oid;
BEGIN
  v_service_role := pg_catalog.to_regrole('service_role');
  v_public_schema := pg_catalog.to_regnamespace('public');

  IF v_service_role IS NULL THEN
    RAISE EXCEPTION 'Checkout privilege check: role service_role does not exist';
  END IF;
  IF v_public_schema IS NULL THEN
    RAISE EXCEPTION 'Checkout privilege check: schema public does not exist';
  END IF;
  IF NOT pg_catalog.has_schema_privilege(v_service_role, v_public_schema, 'USAGE') THEN
    RAISE EXCEPTION 'Checkout privilege check: service_role lacks USAGE on schema public for checkout RPCs';
  END IF;

  FOR v_function IN
    SELECT required.signature,
           pg_catalog.to_regprocedure(required.signature) AS function_oid
    FROM (VALUES
      ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)'),
      ('public.frutall_complete_checkout(uuid,uuid,uuid,text)'),
      ('public.frutall_guard_checkout_line_mutation()')
    ) AS required(signature)
  LOOP
    IF v_function.function_oid IS NULL THEN
      RAISE EXCEPTION 'Checkout privilege check: function % does not exist',
        v_function.signature;
    END IF;

    SELECT p.proowner, r.rolname, r.rolsuper, r.rolbypassrls
    INTO v_requirement
    FROM pg_catalog.pg_proc AS p
    JOIN pg_catalog.pg_roles AS r ON r.oid = p.proowner
    WHERE p.oid = v_function.function_oid;

    IF NOT FOUND OR NOT (v_requirement.rolsuper OR v_requirement.rolbypassrls) THEN
      RAISE EXCEPTION 'Checkout privilege check: owner of % requires BYPASSRLS or SUPERUSER',
        v_function.signature;
    END IF;

    FOR v_schema IN
      SELECT n.oid
      FROM pg_catalog.pg_namespace AS n
      WHERE n.nspname IN ('public', 'auth', 'pg_catalog')
    LOOP
      IF NOT pg_catalog.has_schema_privilege(v_requirement.proowner, v_schema, 'USAGE') THEN
        RAISE EXCEPTION 'Checkout privilege check: owner % of % lacks USAGE on schema %',
          v_requirement.rolname, v_function.signature,
          (SELECT nspname FROM pg_catalog.pg_namespace WHERE oid = v_schema);
      END IF;
    END LOOP;

    FOR v_requirement IN
      SELECT r.oid AS owner_oid, r.rolname, required.table_name,
             required.column_name, required.privilege
      FROM pg_catalog.pg_proc AS p
      JOIN pg_catalog.pg_roles AS r ON r.oid = p.proowner
      CROSS JOIN (
        SELECT 'public.pedidos'::text AS table_name, a.attname::text AS column_name,
               'SELECT'::text AS privilege
        FROM pg_catalog.pg_attribute AS a
        WHERE v_function.signature = 'public.frutall_claim_checkout(uuid,uuid,text,uuid,text)'
          AND a.attrelid = 'public.pedidos'::regclass
          AND a.attnum > 0 AND NOT a.attisdropped
        UNION ALL
        SELECT table_name, column_name, privilege
        FROM (VALUES
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.pedidos', 'stripe_session_id', 'UPDATE'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.pedidos', 'checkout_attempt_id', 'UPDATE'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.pedidos', 'checkout_snapshot', 'UPDATE'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.pedidos', 'checkout_total_cents', 'UPDATE'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.pedidos', 'checkout_started_at', 'UPDATE'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.pedidos', 'total', 'UPDATE'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.lineas_pedido', 'pedido_id', 'SELECT'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.lineas_pedido', 'producto_id', 'SELECT'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.lineas_pedido', 'cantidad', 'SELECT'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.productos', 'id', 'SELECT'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.productos', 'nombre', 'SELECT'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.productos', 'precio', 'SELECT'),
          ('public.frutall_claim_checkout(uuid,uuid,text,uuid,text)', 'public.productos', 'disponible', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'id', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'usuario_id', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'estado', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'metodo_pago', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'pagado', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'checkout_attempt_id', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'checkout_snapshot', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'checkout_total_cents', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'stripe_session_id', 'SELECT'),
          ('public.frutall_complete_checkout(uuid,uuid,uuid,text)', 'public.pedidos', 'stripe_session_id', 'UPDATE'),
          ('public.frutall_guard_checkout_line_mutation()', 'public.pedidos', 'id', 'SELECT'),
          ('public.frutall_guard_checkout_line_mutation()', 'public.pedidos', 'checkout_attempt_id', 'SELECT'),
          ('public.frutall_guard_checkout_line_mutation()', 'public.pedidos', 'checkout_lineas_version', 'SELECT'),
          ('public.frutall_guard_checkout_line_mutation()', 'public.pedidos', 'checkout_lineas_version', 'UPDATE')
        ) AS columns(function_signature, table_name, column_name, privilege)
        WHERE function_signature = v_function.signature
      ) AS required
      WHERE p.oid = v_function.function_oid
    LOOP
      v_table := pg_catalog.to_regclass(v_requirement.table_name);
      SELECT a.attnum
      INTO v_attnum
      FROM pg_catalog.pg_attribute AS a
      WHERE a.attrelid = v_table
        AND a.attname = v_requirement.column_name
        AND a.attnum > 0
        AND NOT a.attisdropped;

      IF v_table IS NULL OR NOT COALESCE(
        pg_catalog.has_column_privilege(
          v_requirement.owner_oid, v_table, v_attnum, v_requirement.privilege
        ), false
      ) THEN
        RAISE EXCEPTION 'Checkout privilege check: owner % of % lacks % on %.%',
          v_requirement.rolname, v_function.signature, v_requirement.privilege,
          v_requirement.table_name, v_requirement.column_name;
      END IF;
    END LOOP;

    -- This manual dependency matrix is a point-in-time check, not an exhaustive
    -- guarantee of future indirect function dependencies.
    FOR v_requirement IN
      SELECT r.oid AS owner_oid, r.rolname, helper.signature
      FROM pg_catalog.pg_proc AS p
      JOIN pg_catalog.pg_roles AS r ON r.oid = p.proowner
      CROSS JOIN (VALUES
        ('all', 'auth.role()'),
        ('locking', 'pg_catalog.pg_advisory_xact_lock(integer,integer)'),
        ('rpc', 'pg_catalog.jsonb_build_object("any")'),
        ('claim', 'pg_catalog.jsonb_build_array("any")'),
        ('claim', 'pg_catalog.jsonb_concat(jsonb,jsonb)'),
        ('all', 'pg_catalog.jsonb_typeof(jsonb)'),
        ('claim', 'pg_catalog.count()'),
        ('claim', 'pg_catalog.sum(numeric)'),
        ('claim', 'pg_catalog.trunc(numeric)'),
        ('claim', 'pg_catalog.btrim(text)'),
        ('claim', 'pg_catalog.round(numeric)'),
        ('claim', 'pg_catalog.now()'),
        ('claim', 'pg_catalog.gen_random_uuid()')
      ) AS helper(scope, signature)
      WHERE p.oid = v_function.function_oid
        AND (
          helper.scope = 'all'
          OR (helper.scope = 'locking' AND v_function.signature <> 'public.frutall_complete_checkout(uuid,uuid,uuid,text)')
          OR (helper.scope = 'rpc' AND v_function.signature <> 'public.frutall_guard_checkout_line_mutation()')
          OR (helper.scope = 'claim' AND v_function.signature = 'public.frutall_claim_checkout(uuid,uuid,text,uuid,text)')
        )
    LOOP
      v_helper := pg_catalog.to_regprocedure(v_requirement.signature);
      IF v_helper IS NULL OR NOT pg_catalog.has_function_privilege(
        v_requirement.owner_oid, v_helper, 'EXECUTE'
      ) THEN
        RAISE EXCEPTION 'Checkout privilege check: owner % of % lacks EXECUTE on %',
          v_requirement.rolname, v_function.signature, v_requirement.signature;
      END IF;
    END LOOP;
  END LOOP;
END;
$checkout_privileges$;

COMMIT;
