## Funcionamiento base de la API

ShipNow API es una aplicación backend construida con Node.js, Express y MongoDB.

En su estado base, la API permite trabajar con tres entidades principales:

* Usuarios
* Comercios
* Pedidos

La idea del proyecto es simular una API simple de logística/envíos.

Un usuario puede representar a un cliente.
Un comercio representa el lugar desde donde sale el pedido.
Un pedido representa una solicitud de envío asociada a un usuario y a un comercio.

### Flujo principal

El flujo básico de la API es:

1. Crear un usuario.
2. Crear un comercio.
3. Crear un pedido usando el ID del usuario y el ID del comercio.
4. Consultar los pedidos.
5. Actualizar el estado de un pedido.

El pedido contiene una lista de items, una dirección de entrega, un total calculado y un estado.

## Nota sobre fidelidad a la consigna

La consigna original del Módulo 1 menciona las entidades `Products` y `Users`. El proyecto ShipNow entregado por la cátedra no incluye una entidad `Products` en su estado base — sus entidades son `User`, `Store` y `Order`. En la primera iteración se refactorizaron `Users`, `Stores` y `Orders` siguiendo el mismo patrón de 3 capas. En esta iteración se agregó además `Products`, con relación a `Store`, para cumplir íntegramente con la consigna.

En el Módulo 5 (Swagger) la consigna pide documentar el grupo Deliveries, pero el proyecto base no tenía endpoints de entregas (solo el modelo y los mocks). Antes de documentarlos se construyó la API de entregas (/api/deliveries) con el mismo patrón de capas, para que la documentación describa endpoints reales. Además, los errores se documentan con el formato que la API realmente devuelve (status, message y code), que difiere del campo error que muestra el ejemplo de la guía.

En el Módulo 6, los tests verifican el campo code de los errores (el que devuelve la API) y la cantidad por defecto de los mocks (10), que difieren de los ejemplos de la guía (error y 50).

### Entidades principales

### User

Representa a un usuario dentro del sistema.

Campos principales:

```json
{
  "firstName": "Martina",
  "lastName": "Gómez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "customer"
}
```

El usuario también tiene un arreglo `documents` con los metadatos de los archivos que cargó (ver *Carga de archivos*).

Roles disponibles:

```txt
admin
customer
store
```

En esta versión base, el usuario se usa principalmente como cliente del pedido.

---

### Store

Representa un comercio.

Campos principales:

```json
{
  "name": "Kiosco Centro",
  "address": "Av. Siempre Viva 742",
  "owner": "ID_DEL_USUARIO"
}
```

El campo `owner` guarda el ID de un usuario asociado al comercio.

---

### Order

Representa un pedido o envío.

Campos principales:

```json
{
  "customer": "ID_DEL_USUARIO",
  "store": "ID_DEL_COMERCIO",
  "deliveryAddress": "Av. Siempre Viva 742",
  "items": [
    {
      "name": "Caja mediana",
      "quantity": 2,
      "price": 1500
    }
  ]
}
```

Cuando se crea un pedido, la API calcula el total automáticamente recorriendo los items.

Ejemplo:

```txt
2 unidades x $1500 = $3000
```

El pedido se crea inicialmente con estado:

```txt
created
```

Estados posibles del pedido:

```txt
created
assigned
picked_up
in_transit
delivered
cancelled
```

### Endpoints disponibles

### Health check

Permite verificar que la API está funcionando. Lo usa Docker (`HEALTHCHECK`) y sirve para herramientas de monitoreo. Es liviano y no expone información sensible (no incluye URIs, credenciales ni versiones).

```http
GET /health
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "API funcionando",
  "environment": "development",
  "uptime": 3600,
  "timestamp": "2026-11-15T14:30:00.000Z"
}
```

`uptime` son los segundos que lleva en línea el proceso.

---

## Users

### Obtener usuarios

```http
GET /api/users?page=1&limit=10&role=driver
```

Listado paginado (ver *Paginación y filtros* más abajo). Filtro opcional: `role` (`admin`, `customer`, `store` o `driver`).

### Obtener usuario por ID

```http
GET /api/users/:uid
```

### Crear usuario

```http
POST /api/users
```

Body de ejemplo:

```json
{
  "firstName": "Martina",
  "lastName": "Gómez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "customer"
}
```

### Actualizar usuario

```http
PUT /api/users/:uid
```

### Eliminar usuario

```http
DELETE /api/users/:uid
```

---

## Stores

### Obtener comercios

```http
GET /api/stores
```

### Obtener comercio por ID

```http
GET /api/stores/:sid
```

### Crear comercio

```http
POST /api/stores
```

Body de ejemplo:

```json
{
  "name": "Kiosco Centro",
  "address": "Av. Siempre Viva 742",
  "owner": "ID_DEL_USUARIO"
}
```

### Actualizar comercio

```http
PUT /api/stores/:sid
```

### Eliminar comercio

```http
DELETE /api/stores/:sid
```

---

## Orders

### Obtener pedidos

```http
GET /api/orders?page=1&limit=10&status=in_transit
```

Listado paginado (ver *Paginación y filtros* más abajo). Filtros opcionales: `status`, `priority`, `customer` (ID) y `store` (ID).

### Obtener pedido por ID

```http
GET /api/orders/:oid
```

### Crear pedido

```http
POST /api/orders
```

Body de ejemplo:

```json
{
  "customer": "ID_DEL_USUARIO",
  "store": "ID_DEL_COMERCIO",
  "deliveryAddress": "Av. Siempre Viva 742",
  "items": [
    {
      "name": "Caja mediana",
      "quantity": 2,
      "price": 1500
    },
    {
      "name": "Sobre chico",
      "quantity": 1,
      "price": 800
    }
  ]
}
```

Respuesta esperada (status 201):

```json
{
  "status": "success",
  "message": "Pedido creado",
  "payload": {
    "_id": "ID_DEL_PEDIDO",
    "customer": "ID_DEL_USUARIO",
    "store": "ID_DEL_COMERCIO",
    "items": [
      {
        "name": "Caja mediana",
        "quantity": 2,
        "price": 1500
      },
      {
        "name": "Sobre chico",
        "quantity": 1,
        "price": 800
      }
    ],
    "deliveryAddress": "Av. Siempre Viva 742",
    "total": 3800,
    "status": "created"
  }
}
```

### Actualizar estado del pedido

```http
PUT /api/orders/:oid/status
```

Body de ejemplo:

```json
{
  "status": "in_transit"
}
```

### Eliminar pedido

```http
DELETE /api/orders/:oid
```

## Products

### Obtener productos

```http
GET /api/products
```

### Obtener producto por ID

```http
GET /api/products/:pid
```

### Crear producto

```http
POST /api/products
```

Body de ejemplo:

```json
{
  "name": "Caja mediana",
  "price": 1500,
  "stock": 10,
  "store": "ID_DEL_COMERCIO"
}
```

El campo `status` (`available` / `out_of_stock`) se calcula automáticamente según el `stock` — no se recibe por body.

### Actualizar producto

```http
PUT /api/products/:pid
```

### Eliminar producto

```http
DELETE /api/products/:pid
```

### Deliveries

Una entrega asigna un repartidor (usuario con role: driver) a un pedido. Ver "Entidad Delivery" más abajo.

### Obtener entregas

```http
GET /api/deliveries?page=1&limit=10&status=assigned
```

Listado paginado (ver *Paginación y filtros* más abajo). Filtros opcionales: `status` y `driver` (ID). Devuelve el pedido y el repartidor completos de cada entrega.

### Obtener entrega por ID

```http
GET /api/deliveries/:did
```

### Crear entrega

```http
POST /api/deliveries
```

Body de ejemplo:

```json
{
  "order": "ID_DEL_PEDIDO",
  "driver": "ID_DEL_REPARTIDOR",
  "priority": "normal",
  "notes": "Entregar en recepción"
}
```

Reglas: el pedido debe existir y no tener una entrega asignada; el usuario debe existir, tener role: driver y estar disponible (isAvailable: true). priority y notes son opcionales. Crear una entrega no modifica el estado del pedido ni la disponibilidad del repartidor.

### Actualizar estado de la entrega

```http
PUT /api/deliveries/:did/status
```

Body de ejemplo:

```json
{
  "status": "in_transit"
}
```

### Eliminar entrega

```http
DELETE /api/deliveries/:did
```

## Mocking

La API expone un conjunto de endpoints bajo `/api/mocks` para generar datos de prueba.

### Generar usuarios falsos (sin guardar)

```http
GET /api/mocks/mockingusers?qty=5
```

Devuelve `qty` usuarios con rol `customer`, generados en memoria. No se guardan en la base. `qty` es opcional (por defecto 10) y debe ser un entero positivo.

### Generar pedidos falsos (sin guardar)

```http
GET /api/mocks/mockingorders?qty=5
```

Devuelve `qty` pedidos simulados, con relaciones coherentes a clientes y comercios generados también en memoria (ninguno se guarda).

### Generar y guardar datos reales

```http
POST /api/mocks/generateData
```
Body de ejemplo:

```json
{
  "users": 10,
  "stores": 5,
  "drivers": 3,
  "orders": 10,
  "deliveries": 5
}
```

Cada cantidad es opcional: si no se envía, se usa un valor por defecto (`users` 10, `stores` 5, `drivers` 3, `orders` 10 y `deliveries` 5). Si se envía, debe ser un entero positivo. Un body vacío usa todos los valores por defecto; un body que no sea un objeto (por ejemplo, un array) responde `VALIDATION_ERROR`.

Los emails generados incluyen una marca única por corrida, por lo que este endpoint puede ejecutarse varias veces sin chocar con datos anteriores.

Genera y guarda en MongoDB, en este orden, respetando las relaciones entre entidades:

1. Usuarios con rol `customer`
2. Usuarios con rol `store`
3. Comercios (`Store`), usando los usuarios-tienda como `owner`
4. Usuarios con rol `driver`
5. Pedidos (`Order`), usando los clientes y comercios ya guardados
6. Entregas (`Delivery`), usando los pedidos y repartidores ya guardados

Respuesta esperada (status 201):

```json
{
  "status": "success",
  "message": "Datos de prueba generados y guardados",
  "payload": {
    "users": 12,
    "stores": 5,
    "drivers": 3,
    "orders": 10,
    "deliveries": 5
  }
}
```

El campo `users` del resultado incluye tanto a los `customer` como a los `store` creados (ambos son documentos de la colección `User`).

### Entidad Delivery

Representa la asignación de un repartidor a un pedido.

Campos principales:

```json
{
  "order": "ID_DEL_PEDIDO",
  "driver": "ID_DEL_REPARTIDOR",
  "status": "assigned",
  "priority": "normal",
  "notes": "Entrega de prueba 1"
}
```

Estados posibles: `assigned`, `in_transit`, `delivered`, `cancelled`.

---

## Carga de archivos (Multer)

La API recibe archivos con **Multer** (`multipart/form-data`). Los archivos se guardan en carpetas del servidor y en MongoDB se registran **solo los metadatos** (nombre original, nombre generado, ruta, MIME type, tamaño, tipo de documento y fecha de carga).

### Configuración

- La configuración está centralizada en `src/middlewares/upload.middleware.js` (no en los routers). Los valores (tipos permitidos, tamaño máximo, carpetas) están como constantes en `src/constants/index.js`.
- **Tipos permitidos:** `application/pdf`, `image/jpeg`, `image/png`, `image/webp`. **Tamaño máximo:** 5 MB.
- **Nombre del archivo:** lo genera el servidor (`<timestamp>-<uuid><extensión>`); el nombre original solo se guarda como metadato.
- **Carpetas:** `uploads/documents` (documentos de usuario), `uploads/licenses` (licencias de repartidor) y `uploads/proofs` (comprobantes de entrega). Se versiona únicamente la estructura (`.gitkeep`); los archivos subidos están en `.gitignore`.
- Si la operación falla después de guardar el archivo (usuario o pedido inexistente, tipo inválido, error de base de datos), el archivo se elimina del servidor para no dejar archivos huérfanos.

### Subir documento de usuario

```txt
POST /api/users/:uid/documents        (multipart/form-data)
```

| Campo | Descripción |
|---|---|
| `type` | `user_document` o `driver_license`. Enviarlo **antes** que el archivo. |
| `document` | Archivo (PDF, JPEG, PNG o WEBP, hasta 5 MB). |

`driver_license` solo se acepta para usuarios con `role: driver`. Responde `200` con los metadatos del documento registrado:

```json
{
  "status": "success",
  "message": "Documento cargado",
  "payload": {
    "originalName": "licencia.pdf",
    "fileName": "1717601111111-3f1c2a7e-8b9d-4c1a-9a55-0f6d2c1e7a10.pdf",
    "path": "uploads/licenses/1717601111111-3f1c2a7e-8b9d-4c1a-9a55-0f6d2c1e7a10.pdf",
    "mimeType": "application/pdf",
    "size": 24533,
    "type": "driver_license",
    "uploadedAt": "2026-11-14T10:00:00.000Z"
  }
}
```

### Subir comprobante de entrega

```txt
POST /api/orders/:oid/proof           (multipart/form-data)
```

| Campo | Descripción |
|---|---|
| `proof` | Archivo (PDF, JPEG, PNG o WEBP, hasta 5 MB). |

Responde `200` con el pedido actualizado (campo `proof` con los metadatos). Si el pedido ya tenía un comprobante, el nuevo lo reemplaza y el archivo anterior se elimina. Esta versión no modifica el estado del pedido al cargar el comprobante.

### Errores de archivos

| Código | Status HTTP | Situación |
|---|---|---|
| `FILE_REQUIRED` | 400 | No se envió ningún archivo |
| `INVALID_FILE_TYPE` | 400 | El MIME type del archivo no está permitido |
| `INVALID_FILE_FIELD` | 400 | El archivo llegó con un nombre de campo distinto al esperado (`document` / `proof`) |
| `INVALID_DOCUMENT_TYPE` | 400 | El `type` no existe o no se envió |
| `FILE_TOO_LARGE` | 413 | El archivo supera los 5 MB |
| `UPLOAD_ERROR` | 500 | No se pudo guardar el archivo en el servidor |

Además se reutilizan `USER_NOT_FOUND`, `ORDER_NOT_FOUND`, `INVALID_ID_MONGOOSE` e `INVALID_DRIVER`. Todos responden con el formato general `{ status, message, code }`.

### Logging de archivos

Se registran: carga exitosa de documento (`info`), comprobante asociado a un pedido (`info`), intento de tipo de archivo no permitido, archivo demasiado grande o campo incorrecto (`warning`), documento o comprobante que no se pudo asociar (`warning`) y errores al guardar (`error`).

### Cómo probarlo

Desde Swagger (`/api/docs`) con *Try it out*, o con curl:

```bash
curl -X POST http://localhost:8080/api/users/ID_USUARIO/documents \
  -F "type=user_document" \
  -F "document=@./documento.pdf"

curl -X POST http://localhost:8080/api/orders/ID_PEDIDO/proof \
  -F "proof=@./entrega.jpg"
```

Los tests de carga están en `tests/uploads.test.js` (usan los archivos de `tests/fixtures/`).

## Manejo de errores

La API centraliza todo el manejo de errores en una única capa, en vez de responder errores de forma aislada en cada ruta o controller. Los errores inesperados se registran con su stack trace en el log, y al cliente le llega un mensaje genérico (INTERNAL_SERVER_ERROR), sin detalles técnicos.

### Cómo funciona

1. Los **Services** detectan los problemas de negocio (un recurso que no existe, datos inválidos, un estado no permitido) y lanzan un error con `createError(CÓDIGO)`.
2. Los **Controllers** nunca arman la respuesta de error ellos mismos: solo hacen `next(error)`, delegando el problema.
3. Un **middleware global** (`src/middlewares/errorHandler.js`), el último en la cadena de `app.js`, recibe cualquier error y arma la respuesta final. También traduce errores técnicos inesperados de Mongoose/MongoDB (un ID con formato inválido, una clave duplicada) a este mismo formato, en vez de exponer el error crudo.
4. Una ruta que no existe se maneja con un middleware separado (`notFoundHandler.js`), con el mismo formato de respuesta.

### Estructura de respuesta de error

```json
{
  "status": "error",
  "message": "Usuario no encontrado",
  "code": "USER_NOT_FOUND"
}
```

### Estructura de respuesta exitosa

```json
{
  "status": "success",
  "message": "Usuario obtenido",
  "payload": { }
}
```

### Códigos de error disponibles

| Código | Status HTTP | Situación |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Faltan datos obligatorios en el body |
| `INVALID_ID_MONGOOSE` | 400 | El ID mandado no tiene formato válido de MongoDB |
| `INVALID_ORDER_STATUS` | 400 | Se intentó setear un estado de pedido que no existe |
| `INVALID_MOCK_AMOUNT` | 400 | La cantidad pedida en `/api/mocks` no es un entero positivo (rechaza decimales, cero, negativos y texto) |
| `INVALID_JSON_BODY` | 400 | El cuerpo de la petición no es un JSON válido |
| `INVALID_DATA` | 400 | Un dato enviado no cumple las reglas del modelo (por ejemplo, un role o una priority que no existen) |
| `INVALID_DELIVERY_STATUS` | 400 | Se intentó setear un estado de entrega que no existe |
| `INVALID_DRIVER` | 400 | 	El usuario indicado como repartidor no tiene role: driver |
| `DUPLICATE_KEY_ERROR` | 409 | Ya existe un registro con ese valor único (por ejemplo, un email repetido) |
| `DRIVER_NOT_AVAILABLE` | 409 | El repartidor no está disponible para tomar una nueva entrega |
| `DELIVERY_ALREADY_ASSIGNED` | 409 | El pedido ya tiene una entrega asignada |
| `USER_NOT_FOUND` / `STORE_NOT_FOUND` / `ORDER_NOT_FOUND` / `PRODUCT_NOT_FOUND` / `DELIVERY_NOT_FOUND` | 404 | El recurso solicitado no existe |
| `ROUTE_NOT_FOUND` | 404 | La URL pedida no coincide con ninguna ruta de la API |
| `FILE_REQUIRED` / `INVALID_FILE_TYPE` / `INVALID_FILE_FIELD` / `INVALID_DOCUMENT_TYPE` | 400 | Errores de carga de archivos (ver sección *Carga de archivos*) |
| `FILE_TOO_LARGE` | 413 | El archivo supera el tamaño máximo permitido (5 MB) |
| `UPLOAD_ERROR` | 500 | No se pudo guardar el archivo en el servidor |
| `INVALID_PAGINATION` | 400 | `page` o `limit` no son enteros positivos, o `limit` supera 100 |
| `INTERNAL_SERVER_ERROR` | 500 | Error inesperado no controlado |

### Cómo probar el comportamiento ante casos inválidos

```http
GET /api/users/000000000000000000000000
```
→ 404, `USER_NOT_FOUND` (ID con formato válido pero que no existe)

```http
GET /api/users/id-invalido
```
→ 400, `INVALID_ID_MONGOOSE`

```http
POST /api/users
Body: {}
```
→ 400, `VALIDATION_ERROR`

```http
PUT /api/orders/:oid/status
Body: { "status": "en_camino" }
```
→ 400, `INVALID_ORDER_STATUS` (valor fuera del enum)

```http
GET /api/mocks/mockingusers?qty=-5
```
→ 400, `INVALID_MOCK_AMOUNT`

```http
POST /api/users
```
(enviando dos veces seguidas el mismo body, con el mismo `email`)
→ la segunda vez responde 409, `DUPLICATE_KEY_ERROR`

```http
GET /api/mocks/mockingusers?qty=2.5
```
→ 400, `INVALID_MOCK_AMOUNT`

```http
POST /api/users
```
(enviando un body con JSON mal formado, por ejemplo con una llave sin cerrar)
→ 400, `INVALID_JSON_BODY`

→ 400, `INVALID_DATA` (el role no es un valor permitido)

```http
PUT /api/deliveries/:did/status
Body: { "status": "volando" }
```

→ 400, `INVALID_DELIVERY_STATUS`

```http
POST /api/deliveries
```

(con el ID de un pedido que ya tiene una entrega asignada) → 409, DELIVERY_ALREADY_ASSIGNED

## Logging y monitoreo

El proyecto usa **Winston** como logger centralizado (`src/config/logger.js`) y **winston-daily-rotate-file** para guardar errores en archivos con rotación diaria. Cualquier módulo puede usarlo con `import logger from '../config/logger.js'`, sin repetir configuración.

### Niveles de log

| Nivel | Valor | Cuándo se usa |
|---|---|---|
| `fatal` | 0 | La aplicación no puede arrancar o seguir (por ejemplo, falla la conexión inicial a MongoDB) |
| `error` | 1 | Errores inesperados del servidor |
| `warning` | 2 | Errores esperados o de negocio (recurso inexistente, datos inválidos, cantidad inválida en mocks, ruta inexistente) |
| `info` | 3 | Eventos normales: servidor iniciado, MongoDB conectado, pedido creado, datos de prueba generados |
| `http` | 4 | Cada petición que recibe la API |
| `debug` | 5 | Detalle técnico útil solo en desarrollo |

En Winston, un número menor significa mayor gravedad, y el nivel configurado actúa como umbral: se muestra ese nivel y todos los más graves.

### Comportamiento según el entorno

El nivel se decide con `NODE_ENV` (validado en `config/env.config.js`):

- **development**: se muestran los seis niveles, incluido `debug` y `http`.
- **production**: se muestra desde `info` hacia arriba (`info`, `warning`, `error`, `fatal`). Así no se registra cada request (nivel `http`) y se evita llenar los logs.

El nivel se puede cambiar con la variable `LOG_LEVEL` (`fatal`, `error`, `warning`, `info`, `http` o `debug`) sin tocar el código.

### Dónde se guardan los logs

Los errores importantes (`error` y `fatal`) se guardan en `logs/errors-YYYY-MM-DD.log`: un archivo por día, conservando los últimos 14 días. La carpeta `logs/` también contiene un archivo de control de la rotación generado por la librería. Todo `logs/` y los archivos `*.log` están en el `.gitignore`, por lo que no se suben al repositorio.

### Cómo probar el logger

```http
GET /loggerTest
```

Genera un mensaje por cada nivel. Para validarlo:

1. En la consola deben aparecer los seis niveles (en `production`, solo desde `info`).
2. En `logs/errors-<fecha>.log` deben quedar únicamente las líneas `ERROR` y `FATAL`.

Para probar el modo producción: `NODE_ENV=production npm start`.

### Eventos registrados

- Servidor iniciado y conexión a MongoDB (`info`); fallo de arranque (`fatal`)
- Cada petición HTTP (`http`)
- Errores esperados de negocio, ruta inexistente y cantidad inválida en mocks (`warning`, vía el middleware de errores)
- Errores inesperados, con stack trace (`error`)
- Generación de datos de prueba y creación de pedidos (`info`)
- Carga de documentos y comprobantes (`info`) y cargas rechazadas o fallidas (`warning` / `error`)

### Documentación con Swagger (OpenAPI)

La API está documentada con OpenAPI 3.0 y se puede explorar y probar desde el navegador con Swagger UI.

- URL: http://localhost:8080/api/docs (el puerto sale de la variable PORT)
- Librerías: swagger-jsdoc (arma el documento a partir de archivos YAML) y swagger-ui-express (muestra la interfaz)

### Dónde está la documentación

Toda la documentación vive en src/docs/, separada de las rutas:


```txt
src/docs/
  swagger.config.js   configuración general: información, servidor, tags y dónde buscar los YAML
  schemas.yaml        schemas reutilizables (entidades, bodies de request, respuesta exitosa y de error)
  errors.yaml         ejemplos de error reutilizables, uno por código del diccionario de errores
  users.yaml          endpoints de usuarios
  stores.yaml         endpoints de comercios
  orders.yaml         endpoints de pedidos
  products.yaml       endpoints de productos
  deliveries.yaml     endpoints de entregas
  mocks.yaml          endpoints de datos de prueba
  logger.yaml         endpoint de prueba del logger
  health.yaml         estado de la API
```

La interfaz se monta en app.js antes del middleware de rutas inexistentes. Los endpoints se agrupan con tags: Users, Stores, Orders, Products, Deliveries, Mocks, Logger y Health.

### Qué documenta cada endpoint

Método, ruta, descripción, parámetros (de ruta o de query), body de la petición, la respuesta exitosa con su schema y las respuestas de error. Solo se documentan los errores que cada endpoint realmente puede devolver, con ejemplos reutilizados desde errors.yaml. El formato de error documentado es el real de la API: status, message y code.

### Cómo probar un endpoint desde Swagger

1. Levantar el servidor (npm run dev).
2. Abrir http://localhost:8080/api/docs.
3. Expandir un endpoint, presionar Try it out, completar parámetros o body y presionar Execute.

### Cómo documentar un endpoint nuevo

1. Abrir (o crear) el YAML del grupo en src/docs/.
2. Agregar la ruta con su tags, parameters, requestBody y responses, reutilizando schemas y ejemplos con $ref.
3. Guardar: nodemon también vigila los archivos .yaml y reinicia el servidor solo.

Si un grupo aparece vacío en Swagger, conviene revisar la terminal: un error de sangría en el YAML descarta todo el archivo.

## Testing

La API cuenta con tests automatizados de integración. Se escriben con **Mocha** (organiza y ejecuta los tests), **Chai** (compara lo obtenido con lo esperado) y **Supertest** (hace peticiones HTTP a la aplicación sin necesidad de levantar el servidor).

### Cómo ejecutar los tests

Los tests **no necesitan una base de datos instalada ni un archivo `.env.test`**: usan una base MongoDB en memoria (`mongodb-memory-server`) que se crea al empezar y se apaga al terminar. Desde una instalación limpia:

```bash
npm install
npm test
```

- La **primera vez** `mongodb-memory-server` descarga el binario de MongoDB (unos 100 MB, requiere internet). Queda en caché y las siguientes ejecuciones son inmediatas.
- `NODE_ENV=test` lo define el propio proyecto (`tests/env.setup.js`), por lo que no hace falta `cross-env` ni ninguna variable previa.
- Si el paquete no está instalado (por ejemplo, tras instalar solo dependencias de producción), `npm test` falla: los tests necesitan las dependencias de desarrollo (`npm install` las incluye).

Para ejecutar solo un grupo, filtrando por nombre:

```bash
npm test -- --grep "Orders API"
```

**Opcional: usar una base externa (por ejemplo, MongoDB Atlas).** Crear `.env.test` a partir de `.env.test.example` con `TEST_MONGODB_URI` apuntando a una base **distinta a la de desarrollo**, cuyo nombre incluya `test` (por ejemplo `shipnow-test`). Si esa variable está definida, los tests la usan en lugar de la base en memoria.

Durante los tests el logger queda en silencio para no mezclar sus mensajes con el resultado.

### Cómo están organizados

```txt
tests/
  env.setup.js          define NODE_ENV=test y levanta la base MongoDB en memoria
  setup.js              conexión a la base de testing, limpieza inicial y final
  helpers/
    db.js               limpieza de colecciones y desconexión
    factories.js        funciones que crean datos de prueba (usuarios, pedidos, entregas...)
    assertions.js       verificaciones reutilizables del formato de respuesta
    routes.js           lista las rutas reales de la aplicación
  users.test.js
  stores.test.js
  orders.test.js
  products.test.js
  deliveries.test.js
  mocks.test.js
  logger.test.js
  health.test.js
  errors.test.js
  swagger.test.js
  pagination.test.js    paginación y filtros de los listados
  production.test.js    endpoints internos por entorno y validación de variables de entorno
  uploads.test.js       carga de documentos y comprobantes (usa tests/fixtures/)
  fixtures/             archivos de ejemplo para los tests de carga
```

### Qué se prueba

| Archivo | Qué cubre |
|---|---|
| `users.test.js` | Listar, consultar, crear (con valores por defecto), actualizar y eliminar usuarios. Errores: datos faltantes, `role` inválido, email duplicado, ID inválido y usuario inexistente |
| `orders.test.js` | Listar (con cliente y comercio completos), consultar, crear (con total calculado y estado inicial), actualizar estado y eliminar. Errores: items faltantes o vacíos, falta de dirección, cliente o comercio inexistente, ID inválido, prioridad inválida, estado inválido y pedido inexistente |
| `deliveries.test.js` | Listar, consultar, asignar un repartidor, actualizar estado y eliminar. Reglas de negocio: repartidor inexistente, que no sea repartidor o que no esté disponible, pedido que ya tiene una entrega, prioridad y estado inválidos |
| `stores.test.js` y `products.test.js` | Operaciones básicas y cálculo automático del `status` de un producto según su stock |
| `mocks.test.js` | `mockingusers` y `mockingorders` (cantidad por defecto, cantidad pedida, sin guardar en la base, cantidades inválidas) y `generateData` (guardado, referencias coherentes entre entidades, ejecución repetida, valores por defecto, cantidades y body inválidos) |
| `logger.test.js` y `health.test.js` | El endpoint `/loggerTest` y los endpoints de estado de la API |
| `errors.test.js` | Ruta inexistente, JSON mal formado, ID inválido e inexistente en los cinco recursos, y error inesperado sin exponer detalles técnicos |
| `swagger.test.js` | Swagger UI disponible y coherencia entre la documentación y la API real |
| `pagination.test.js` | Paginación por omisión, `page` y `limit`, páginas sin repetidos, página fuera de rango, valores inválidos y filtros (rol, estado, prioridad, cliente, repartidor), incluido el rechazo de operadores de Mongo en los filtros |
| `production.test.js` | Mocks y `/loggerTest` no disponibles en producción (y sí en desarrollo), `/health`, Swagger y endpoints principales disponibles, y validación de variables de entorno al iniciar (faltantes, inválidas y valores por defecto) |

### Aislamiento de los tests

- Usan una **base de datos de testing separada** (en memoria por omisión). Antes de empezar, el `setup` se niega a correr si el nombre de la base no contiene `test`, para que nunca se limpien los datos de desarrollo.
- Cada test crea los datos que necesita con las funciones de `helpers/factories.js` y, al terminar, se vacían las colecciones (se borran los documentos, pero se conservan las colecciones y sus índices, como el del email único). Por eso ningún test depende de otro ni del orden de ejecución.

### Coherencia con Swagger

`swagger.test.js` comprueba automáticamente que la documentación diga la verdad:

- Todas las rutas documentadas existen en la API, y todas las rutas de la API están documentadas.
- Cada ejemplo de error documentado coincide con el diccionario de errores (código y mensaje).
- Cada error se documenta bajo el status HTTP que realmente le corresponde.
- Todos los códigos del diccionario están documentados (salvo `ROUTE_NOT_FOUND`).
- Los endpoints que crean recursos documentan el status `201`.

## Instalación y ejecución

1. Clonar el repositorio y entrar a la carpeta del proyecto.
2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo `.env` en la raíz a partir de `.env.example` (ver la tabla de variables en *Producción y Docker*). Como mínimo:

```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/shipnow?appName=shipnowDB
```

4. Levantar el servidor en modo desarrollo:

```bash
npm run dev
```

5. La API queda disponible en `http://localhost:8080`.

## Producción y Docker

> **Estado de la verificación:** el `Dockerfile` y el `.dockerignore` se probaron el 26/11/2026 en Windows con Docker Desktop 4.99.0 (Docker Engine 29.9.3): la imagen se construye, el contenedor arranca, queda `healthy`, y responden `/health`, Swagger y `/api/orders`. Los resultados reales están en *Evidencia de verificación*. `docker-compose.yml` (opcional) también se verificó. Los 171 tests automatizados pasan con `npm test`.

### Variables de entorno

La configuración se lee **solo** desde `src/config/env.config.js`, que valida las variables al iniciar: si falta una variable crítica o tiene un valor inválido, la API **no arranca** y muestra un mensaje que indica qué corregir. No hay valores sensibles escritos en el código. El archivo `.env.example` tiene todas las variables.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NODE_ENV` | Sí | `development`, `test` o `production` |
| `PORT` | Sí | Puerto en el que escucha la API (número entre 1 y 65535) |
| `MONGODB_URI` | Sí | Cadena de conexión a MongoDB |
| `LOG_LEVEL` | No | `fatal`, `error`, `warning`, `info`, `http` o `debug`. Por omisión: `debug` en desarrollo y `info` en producción |
| `CLIENT_URL` | Solo en producción | Origen(es) del cliente permitidos por CORS (varios, separados por comas). En desarrollo, por omisión `http://localhost:5173` |
| `API_URL` | No | URL pública de la API, que se muestra en Swagger. Por omisión `http://localhost:<PORT>` |
| `JWT_SECRET` | No aplica | El proyecto todavía no tiene autenticación, así que no se usa |

Hay tres entornos: **desarrollo** (`.env`), **testing** (base MongoDB en memoria por omisión, sin configurar nada) y **producción** (variables definidas en el servidor o en el contenedor).

### Correr la API localmente

```bash
npm install
cp .env.example .env     # completar MONGODB_URI
npm run dev              # desarrollo, con reinicio automático
npm start                # sin reinicio automático (es lo que usa la imagen Docker)
```

### Correr los tests

Se ejecutan fuera del contenedor, con una base en memoria (no hace falta configurar nada; ver la sección *Testing*):

```bash
npm test
```

### Acceder a Swagger

`http://localhost:<PORT>/api/docs` (con Docker y el puerto por omisión: `http://localhost:8080/api/docs`).

### Criterio para los endpoints internos

| Endpoint | En producción | Motivo |
|---|---|---|
| `/api/mocks/*` | **No se monta** (responde `404 ROUTE_NOT_FOUND`) | Genera y guarda datos falsos en la base |
| `/loggerTest` | **No se monta** (responde `404 ROUTE_NOT_FOUND`) | Es una herramienta de prueba que escribe logs |
| `/api/docs` (Swagger) | Disponible | Es documentación, no expone datos sensibles |
| `/health` | Disponible | Lo necesitan Docker y el monitoreo |

El criterio se define en `createApp` (`src/app.js`) según `NODE_ENV`.

### Performance

- **Paginación y filtros:** `GET /api/users`, `/api/orders` y `/api/deliveries` ya no devuelven la colección completa. Los comercios y productos son catálogos chicos y siguen devolviendo la lista completa.
- **Consultas:** los filtros usan campos con índice (`role`, `status`, `customer`, `store`, `driver`, `order`), el orden es estable (por `_id`) y la cantidad total se cuenta en paralelo con la consulta.
- **Sin bloqueos:** no hay operaciones sincrónicas pesadas en las requests. La carpeta de destino de los archivos se crea de forma asíncrona, y el body JSON está limitado a 100 KB.
- **Archivos:** máximo 5 MB, solo PDF, JPEG, PNG y WEBP, con errores controlados (ver *Carga de archivos*). Los archivos subidos no se versionan en Git.
- **Logs:** en producción el nivel por omisión es `info`, así que no se registra cada request.

#### Paginación y filtros

| Parámetro | Descripción |
|---|---|
| `page` | Número de página. Por omisión `1` |
| `limit` | Resultados por página. Por omisión `10`, máximo `100` |

Si `page` o `limit` no son enteros positivos, o `limit` supera 100, responde `400 INVALID_PAGINATION`. La respuesta mantiene `payload` como lista y suma un bloque `pagination`:

```json
{
  "status": "success",
  "message": "Lista de pedidos",
  "payload": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Un filtro con un valor inexistente responde con el error del recurso (`INVALID_ORDER_STATUS`, `INVALID_DELIVERY_STATUS` o `INVALID_DATA`), y un ID de filtro inválido responde `INVALID_ID_MONGOOSE`.

### Docker

El proyecto incluye:

- `Dockerfile`: imagen base `node:22-alpine`; copia el proyecto, instala las dependencias de producción con `npm ci --omit=dev`, expone el puerto `8080` y ejecuta `node src/server.js` (el mismo comando que `npm start`, directo con `node` para que la señal `SIGTERM` de Docker llegue a la API). Corre con el usuario `node`, sin privilegios de root, y define un `HEALTHCHECK` sobre `/health`.
- `.dockerignore`: deja afuera `node_modules`, `.env` (y cualquier `.env.*`), `.git`, `logs`, `uploads`, `coverage`, `tests` y archivos temporales.
- `docker-compose.yml` (opcional, verificado): levanta la API con un solo comando.

**Construir la imagen:**

```bash
docker build -t shipnow-api .
```

**Ejecutar el contenedor** pasando las variables desde un archivo externo (el `.env` nunca se copia a la imagen):

```bash
docker run -d --name shipnow-api -p 8080:8080 --env-file .env shipnow-api
```

- Con `--env-file` las comillas se toman literalmente: escribir los valores del `.env` **sin comillas** (`PORT=8080`, no `PORT="8080"`).
- Si en `.env` cambiás `PORT`, usá el mismo número en `-p` (`-p <PORT>:<PORT>`).
- Para probar el modo producción se pueden pisar variables con `-e`, por ejemplo `-e NODE_ENV=production -e CLIENT_URL=http://localhost:5173`.

**Probar que funciona:**

```bash
curl http://localhost:8080/health          # estado de la API
# Swagger: http://localhost:8080/api/docs
curl http://localhost:8080/api/orders      # endpoint principal (listado paginado)
docker ps                                   # la columna STATUS muestra "healthy" cuando el HEALTHCHECK anda
docker logs shipnow-api                     # logs de la API
docker stop shipnow-api                     # envía SIGTERM: la API cierra las conexiones y MongoDB ordenadamente
```

**Con Docker Compose** (opcional):

```bash
docker compose up --build
```

La API usa MongoDB Atlas, por lo que alcanza con definir `MONGODB_URI`. Si se quisiera una base local en Docker, habría que sumarla como otro servicio en el `docker-compose.yml`.

### Cierre ordenado (graceful shutdown)

Cuando el proceso recibe `SIGTERM` (Docker al detener o actualizar el contenedor) o `SIGINT` (`Ctrl+C`), la API deja de aceptar conexiones nuevas, espera a que terminen las que están en curso, cierra la conexión a MongoDB y sale. Si el cierre tarda más de 10 segundos, fuerza la salida.

### Archivos que no deben subirse al repositorio

`node_modules/`, `.env` y `.env.test` (con credenciales), `logs/`, `uploads/` (solo se versionan los `.gitkeep` de la estructura), `coverage/` y cualquier archivo temporal. Sí se versionan `.env.example` y `.env.test.example`, sin valores reales.

### Logs y uploads en Docker

Los logs salen por la consola del contenedor (`docker logs`) y los errores también se guardan en `logs/`. Los archivos subidos se guardan en `uploads/`. **Dentro del contenedor esos archivos no son almacenamiento permanente:** se pierden si el contenedor se elimina. Con `docker-compose.yml` ambas carpetas usan volúmenes; con `docker run` se pueden montar con `-v`. En un entorno de producción real los archivos deberían ir a un servicio externo (S3, Cloudinary o similar), y además eso es necesario para poder correr varias instancias de la API.

### Evidencia de verificación

Verificado el 26/11/2026 en Windows, con Docker Desktop 4.99.0 (Docker Engine 29.9.3), imagen base `node:22-alpine` y MongoDB Atlas. Los valores sensibles no se muestran.

| Criterio de la rúbrica | Dónde está | Cómo verificarlo | Resultado verificado |
|---|---|---|---|
| Paginación y filtros | `src/utils/query.utils.js`, `tests/pagination.test.js` | `curl "http://localhost:8080/api/orders?limit=2"` | Responde `payload` y el bloque `pagination` |
| Límites en la carga de archivos | `src/middlewares/upload.middleware.js`, `tests/uploads.test.js`, `.gitignore` | `npm test` | Máximo 5 MB, solo PDF/JPEG/PNG/WEBP; `uploads/` no se versiona |
| Variables de entorno validadas | `src/config/env.config.js`, `.env.example`, `tests/production.test.js` | `npm test` | Sin variables críticas, la API no arranca y muestra un mensaje claro |
| Health check | `/health`, `tests/health.test.js` | `curl http://localhost:8080/health` | 200 con `status`, `message`, `environment`, `uptime` y `timestamp` |
| Endpoints internos | `createApp` en `src/app.js` | Contenedor con `-e NODE_ENV=production` | `/api/mocks/*` y `/loggerTest` responden 404 `ROUTE_NOT_FOUND`; Swagger y `/health` siguen disponibles |
| Tests automatizados | `tests/` | `npm test` | 171 passing (2 s) |
| Dockerfile funcional | `Dockerfile` | `docker build -t shipnow-api .` | Build terminado (11/11 pasos) |
| `.dockerignore` | `.dockerignore` | `docker run --rm shipnow-api ls -a /app` | La imagen no contiene `.env`, `.git`, `tests`, `README.md` ni archivos de `uploads/` |
| Variables desde archivo externo y puerto | `docker run --env-file .env` | `docker ps` | Contenedor `healthy`, puerto `8080` publicado |
| Cierre ordenado | `src/server.js` | `docker stop` | Log de `SIGTERM` y cierre de servidor y MongoDB |
| Docker Compose (opcional) | `docker-compose.yml` | `docker compose up -d` | Servicio `healthy` y `/health` responde 200 |

**Construcción de la imagen** (`docker build -t shipnow-api .`): terminó en 16,3 s con 11/11 pasos. El contexto enviado a Docker fue de 268,58 kB, porque `.dockerignore` deja afuera `node_modules`, `.git` y `uploads`. Las dependencias se instalaron dentro de la imagen con `npm ci --omit=dev`.

**Contenedor en ejecución** (`docker run -d --name shipnow-api -p 8080:8080 --env-file .env shipnow-api`):

```text
$ curl http://localhost:8080/health
{"status":"success","message":"API funcionando","environment":"development","uptime":44,"timestamp":"2026-11-26T21:17:10.977Z"}

$ docker ps
IMAGE         STATUS                    PORTS
shipnow-api   Up 44 seconds (healthy)   0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp

$ docker logs shipnow-api
2026-11-26 21:16:28 [INFO]: MongoDB conectado
2026-11-26 21:16:28 [INFO]: Servidor escuchando en el puerto 8080 (entorno: development)
```

**Swagger y endpoint principal:**

```text
$ curl.exe -s -o NUL -w "swagger: %{http_code}\n" http://localhost:8080/api/docs/
swagger: 200

$ curl.exe -s "http://localhost:8080/api/orders?limit=2"
{"status":"success","message":"Lista de pedidos","payload":[],"pagination":{"page":1,"limit":2,"total":0,"totalPages":0,"hasNextPage":false,"hasPrevPage":false}}
```

La base de la prueba no tenía pedidos, por eso `payload` está vacío y `total` es `0`; la estructura de la respuesta paginada es la que se documenta en *Paginación y filtros*.

**Contenido de la imagen** (no hay `.env`, `.git`, `tests` ni `README.md`; las carpetas de `uploads` están vacías):

```text
$ docker run --rm shipnow-api ls -a /app
.  ..  logs  node_modules  package-lock.json  package.json  src  uploads

$ docker run --rm shipnow-api ls -a /app/uploads
.  ..  documents  licenses  proofs
```

**Modo producción** (`docker run -d --name shipnow-prod -p 8081:8080 --env-file .env -e NODE_ENV=production -e CLIENT_URL=http://localhost:5173 shipnow-api`):

```text
$ curl.exe -s http://localhost:8081/health
{"status":"success","message":"API funcionando","environment":"production","uptime":138,"timestamp":"2026-11-26T21:21:58.384Z"}

$ curl.exe -s http://localhost:8081/api/mocks/mockingusers
{"status":"error","message":"Ruta no encontrada","code":"ROUTE_NOT_FOUND"}

$ curl.exe -s http://localhost:8081/loggerTest
{"status":"error","message":"Ruta no encontrada","code":"ROUTE_NOT_FOUND"}
```

**Cierre ordenado** (`docker stop shipnow-prod shipnow-api`): el comando volvió enseguida y los logs registran la señal y el cierre.

```text
2026-11-26 21:22:47 [INFO]: Señal SIGTERM recibida: cerrando el servidor
2026-11-26 21:22:47 [INFO]: Servidor y conexión a MongoDB cerrados correctamente
```

**Docker Compose** (`docker compose up -d`, espera de 25 s, `curl`, `docker compose ps`, `docker compose down`):

```text
$ curl.exe -s http://localhost:8080/health
{"status":"success","message":"API funcionando","environment":"development","uptime":26,"timestamp":"2026-11-26T21:27:51.746Z"}

$ docker compose ps
NAME                      IMAGE         SERVICE   STATUS                    PORTS
shipnow-api-95295-api-1   shipnow-api   api       Up 25 seconds (healthy)   0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp
```

**Tests automatizados** (`npm test`, fuera del contenedor, con base MongoDB en memoria): `171 passing (2s)`.

## Arquitectura por capas

El proyecto sigue el patrón **Controller → Service → Repository**:

- **Controller**: recibe la request y la respuesta HTTP (`req`/`res`), valida el formato básico de los datos, delega en el Service correspondiente y devuelve el status code adecuado. No conoce Mongoose.
- **Service**: contiene la lógica de negocio. Por ejemplo, en Orders valida que el `customer` y el `store` existan antes de crear el pedido, y calcula el `total` sumando `price * quantity` de cada ítem. No conoce Express ni `req`/`res`.
- **Repository**: es la única capa que importa los modelos de Mongoose. Expone operaciones de acceso a datos (`find`, `create`, `findByIdAndUpdate`, etc.) sin lógica de negocio.

Esta separación permite testear la lógica de negocio sin depender de HTTP ni de la base de datos real, y aísla el impacto de un eventual cambio de base de datos u ORM a una sola capa.

## Estado actual del proyecto

La API fue refactorizada de una estructura monolítica (toda la lógica en las rutas) a una arquitectura de 3 capas.

Actualmente el proyecto tiene:

```txt
app.js
server.js
models
controllers
errors
middlewares
services
repositories
routes
config/db.js
config/env.config.js
config/logger.js
constants/index.js
mocks
docs
test
```

La configuración de entorno (`PORT`, `MONGODB_URI`, `NODE_ENV`) se valida al arranque: si falta alguna variable crítica, la aplicación no inicia y muestra un error descriptivo. Los roles de usuario, estados y prioridad de los pedidos están centralizados como constantes inmutables (`Object.freeze`) en `constants/index.js`.
La API ahora incluye generación de datos de prueba (mocking) bajo `/api/mocks`, y una nueva entidad `Delivery` que representa la asignación de un repartidor (`role: driver`) a un pedido.
Se agregó la entidad `Products`, con relación a `Store` y cálculo automático de `status` según `stock`, cumpliendo con la consigna original del Módulo 1.
Se eliminaron los accesos directos a `process.env` en `server.js` y `config/db.js`: toda la configuración se consume exclusivamente desde `config/env.config.js`.
El manejo de errores está centralizado en un middleware global (`errorHandler.js`), con un diccionario de errores de dominio (`errorDictionary.js`) y validación de entradas en el módulo de mocks.
Se incorporó logging centralizado con Winston (niveles, archivos con rotación, endpoint /loggerTest).
Se agregó la API de entregas (/api/deliveries), con reglas de negocio (el repartidor debe estar disponible y el pedido no puede tener dos entregas). La API está documentada con Swagger (OpenAPI 3.0) y se puede explorar en /api/docs.
Se incorporaron tests automatizados de integración (Mocha, Chai y Supertest) con una base de datos de testing separada (npm test).
Se agregó la carga de archivos con Multer: documentos de usuario (`POST /api/users/:uid/documents`) y comprobantes de entrega (`POST /api/orders/:oid/proof`), con validaciones, errores centralizados, logging, Swagger y tests.


Durante el curso, la API será mejorada progresivamente para separar responsabilidades, mejorar la mantenibilidad y acercarse a una estructura más profesional.
Se preparó la API para producción: listados paginados y con filtros, configuración por entorno validada al iniciar, health check ampliado, cierre ordenado del servidor y archivos de Docker (`Dockerfile`, `.dockerignore` y `docker-compose.yml`), los dos primeros verificados en Docker Desktop (ver la sección *Evidencia de verificación*) y el `docker-compose.yml` (opcional), también verificado. Ver la sección *Producción y Docker*.