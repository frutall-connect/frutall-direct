# Prototipo sintetico de checkout: fase 1B

**NO DESPLEGABLE. NO EJECUTADO NI VALIDADO.** Los archivos `.sql.txt` son
material de ensayo, no migraciones. No copiarlos a rutas de despliegue. No hay
integracion con ninguna aplicacion, datos reales, proveedor de pagos ni
servicio externo. Las guardas de los archivos son defensas adicionales: un
nombre de base, un rol y una direccion local **no prueban** que la instancia
sea desechable.

Esta reconstruccion conserva cinco tablas, sin tablas adicionales ni
referencias a objetos reales. Se ha preparado mediante lectura y edicion; **no
se ha ejecutado SQL ni ninguna prueba**. La compatibilidad con PostgreSQL, la
seguridad efectiva y el comportamiento concurrente estan pendientes.

## Arquitectura

- `checkout_intentos`: identidad logica cuenta/clave, snapshot sintetico,
  total, estado y version. Se conserva indefinidamente durante el ensayo.
- `checkout_sesiones`: una observacion sintetica determinista por intento,
  asociada de manera permanente y con referencia a la operacion que la creo.
- `checkout_webhook_inbox`: evento sintetico con identidad y caso originales;
  version, estado, marca de contradiccion y referencias a recepcion/evidencia.
- `checkout_trabajos`: una fila por tipo y destino, incluidas las revisiones y
  finalizaciones. Guarda version, generaciones, lease, fence y evidencia.
- `checkout_auditoria`: resultado idempotente y cambios antes/despues de cada
  operacion confirmada, identificada por actor y numero de operacion.

Las referencias de evidencia a auditoria son FK diferibles: al confirmar
debe existir el registro de la operacion en la misma transaccion. Las
sesiones/eventos/trabajos referencian sus destinos internos. No hay borrado
ordinario ni rutina de purga; esto impide reutilizar identidades durante la
vida del ensayo, no define una politica de retencion de produccion.

## Datos y snapshot

Solo se aceptan dos cuentas, tres claves, dos productos y los casos cerrados
del codigo. Las identidades numericas se limitan a 1..1000000 y son
exclusivamente identificadores de ensayo. No deben introducirse datos reales.
El modelo no puede demostrar semanticamente que un identificador aportado sea
sintetico; la instancia y su origen deben ser controlados.
La sesion sintetica se deriva deterministicamente del intento y solo se
permite una por intento; por tanto, el prototipo no modela ni valida respuestas
externas que produzcan varias sesiones para una misma operacion.

La entrada de lineas solo contiene `producto` y `cantidad`; se ordena por
producto y rechaza duplicados, campos extra y cantidades fuera de 1..100.
El catalogo interno asigna 500 y 300 centimos a los productos A y B. El
snapshot version 1 incluye precios y subtotales calculados y un total sumado
en enteros. No se aceptan precios ni totales del llamador. El limite de dos
lineas hace que las operaciones aritmeticas queden dentro de `bigint`.
Esto no valida precios, moneda ni reglas comerciales reales.

## Estados y operaciones

La unica entrada de escritura es `operar(id_operacion, accion, argumentos)`.
Cada identidad de operacion pertenece al actor de sesion. Repetirla con accion
y argumentos canonicos iguales devuelve el resultado original; contenido
diferente falla. La repeticion devuelve el resultado historico, no prueba que
un lease siga vigente. Se usan versiones esperadas para los cambios sensibles.

| Objeto | Estados y transiciones |
|---|---|
| Intento | `preparado -> creacion_incierta -> sesion_observada`; cualquiera puede pasar a `revision_manual`. Revision no se reabre. |
| Sesion | Una observacion sintetica inmutable y asociada al crearla. En revision se registra como tardia sin resolver el intento. |
| Evento | `pendiente -> procesado`, `descartado` o `revision_manual`. Una contradiccion posterior conserva el estado final, activa `conflicto` y lleva el intento original a revision. |
| Trabajo | `pendiente -> ejecutando -> finalizado` o `pendiente` si hay generacion posterior. `pendiente/ejecutando -> revision_manual`; no hay salida de revision. Un lease caducado permite nueva reclamacion con nuevo fence. |

Acciones:

1. `crear_intento`, `comenzar_intento`, `revision_intento`, `observar_sesion`.
2. `recibir_evento`: compara la identidad y el caso originales; una
   contradiccion se conserva en auditoria y no sustituye la evidencia.
3. `solicitar_trabajo`, `reclamar_trabajo`, `renovar_trabajo`,
   `finalizar_trabajo`, `revision_trabajo`, `consultar_trabajo`.

Finalizar comprueba actor, token, version, fence, generacion y lease. El
despacho exige una sesion sintetica vinculada; la reconciliacion pone el
intento en revision; procesar un evento aplica su efecto sintetico en la misma
transaccion o lo descarta por el caso cerrado. Si hay una generacion posterior,
la fila queda pendiente. La evidencia es exclusivamente interna y sintetica:
no acredita un efecto externo ni un pago.

`revision_trabajo` es una medida conservadora disponible para cualquiera de
los dos actores con la version actual, incluso si otro actor tiene el lease.
No hay salida automatica de revision ni resolucion manual implementada.

## Concurrencia, idempotencia y auditoria

Todas las llamadas adquieren el mismo advisory lock transaccional mediante
`pg_try_advisory_xact_lock`; si esta ocupado devuelven `55P03`. Esto serializa
las operaciones autorizadas y fija un orden global simple en este prototipo;
se exige `READ COMMITTED`. El bloqueo se mantiene hasta el fin de la
transaccion, por lo que un llamador que la deje abierta bloquea a los demas.
No usarlo como mecanismo de disponibilidad o de produccion. Un actor que pueda
adquirir el mismo advisory lock puede denegar servicio.

El lease es una ayuda para recuperar trabajo, no prueba de ausencia de un
efecto externo. Cada reclamacion genera un token y aumenta el fence. Un actor
que comparta credenciales con otro proceso comparte su identidad y puede
reproducir su operacion; el aislamiento entre procesos requiere principales
diferentes y proteccion de los tokens. La auditoria contiene los tokens y
solo el propietario puede leerla directamente. Cada actor puede recuperar sus
propios resultados idempotentes, incluidos los tokens de reclamacion.

Las operaciones escriben auditoria y cambios en una transaccion. Si falla la
auditoria, falla la operacion: la integridad tiene prioridad sobre la
disponibilidad. No se registran necesariamente errores o rechazos que revierten.
El valor devuelto por `operar` no acredita confirmacion hasta que la
transaccion que lo contiene haga COMMIT; si su resultado es incierto, debe
consultarse mediante repeticion de la misma identidad y parametros.
Las versiones ordenan cambios por entidad y el registro contiene actor, accion,
parametros, motivos cerrados y antes/despues. El reloj no demuestra un orden
global de commit. Resultados ya confirmados no se deshacen por una respuesta
tardia; una contradiccion se deja marcada y el intento pasa a revision.

## Seguridad y sus limites

El modelo espera tres roles **ya existentes solo en la instancia desechable**:
`frutall_1b_owner`, `frutall_1b_actor_a`, `frutall_1b_actor_b`. El archivo no
crea roles ni cambia membresias; crea objetos y concede permisos solo sobre
los objetos nuevos. La guarda rechaza los roles si tienen privilegios
administrativos o membresias. Debe comprobarse independientemente que nadie
mas pueda asumir o controlar esos roles y que la instancia no contenga roles
ni datos reales.

Los actores tienen USAGE de esquema y EXECUTE de `operar`, no acceso directo
a tablas ni helpers. La funcion es `SECURITY DEFINER`, su `search_path` es
`pg_catalog`, los objetos propios estan cualificados y valida `session_user`.
El propietario crea las tablas y ejecuta la funcion privilegiada; puede leer,
escribir, fabricar auditoria o alterar triggers. Superusuarios, propietarios,
administradores y roles comprometidos quedan fuera del modelo de amenaza.
Las restricciones sobre borrado/auditoria son defensa adicional, no protegen
frente al propietario. No se han comprobado privilegios efectivos.

El conjunto cerrado reduce entradas arbitrarias pero no garantiza por si
mismo la naturaleza sintetica de todos los datos. No hay identidad de pedido,
regla de un intento por pedido, autenticacion de usuarios reales, validacion
economica real, procesamiento externo, worker ni reconciliador operativo.

## Ejecucion futura, solo con autorizacion adicional

1. Identificar y verificar independientemente una **instancia PostgreSQL
   local separada, desechable y vacia**, sin roles ni datos reales. Las bases
   de la misma instancia comparten roles. Confirmar base
   `frutall_checkout_1b_test_disposable`, version 13 o posterior y los tres
   roles sinteticos sin privilegios administrativos ni membresias. El
   propietario necesita crear el esquema en esa base. Los actores necesitan
   conectarse con su propia identidad; `SET ROLE` no sustituye `session_user`.
2. Comprobar manualmente destino, autenticacion, roles, permisos e aislamiento
   antes de cada conexion y no usar configuraciones o credenciales reales.
3. Configurar el cliente para detenerse ante cualquier error y devolver codigo
   de salida distinto de cero; por ejemplo, en `psql`, activar
   `ON_ERROR_STOP`. Los archivos no fuerzan por si solos el codigo de salida.
4. En una sesion del propietario, aplicar `modelo.sql.txt`. Si el esquema ya
   existe, debe fallar. En una sesion nueva del actor A, aplicar
   `datos_sinteticos.sql.txt`.
5. En sesion del propietario, ejecutar `verificacion_propietario.sql.txt`.
   En sesion del actor A, ejecutar `pruebas_aisladas.sql.txt`. Este ultimo
   revierte sus cambios, pero no sustituye una instancia desechable.
6. Usar otra instancia desechable limpia para las pruebas de dos sesiones
   descritas en `concurrencia.no-ejecutar.txt`; algunas confirman cambios.
   Revisar su auditoria con el propietario y descartar la instancia.

Los pasos son instrucciones de ensayo futuro, no autorizacion para ejecutar.
Los archivos de pruebas pueden contener errores: no se han probado.
