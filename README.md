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

Permite verificar que la API está funcionando.

```http
GET /health
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "API funcionando"
}
```

---

## Users

### Obtener usuarios

```http
GET /api/users
```

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
GET /api/orders
```

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
GET /api/deliveries
```

Devuelve el pedido y el repartidor completos de cada entrega.

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
- **production**: se muestra desde `info` hacia arriba (`info`, `warning`, `error`, `fatal`).

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

1. Crear un archivo `.env.test` en la raíz a partir de `.env.test.example`. La variable `MONGODB_URI` debe apuntar a una base de datos **distinta a la de desarrollo** (por ejemplo `shipnow-test`):

```env
PORT=8081
MONGODB_URI=<tu-connection-string-de-mongodb-atlas>/shipnow-test
NODE_ENV=test
```

2. Ejecutar todos los tests:

```bash
npm test
```

Para ejecutar solo un grupo, filtrando por nombre:

```bash
npm test -- --grep "Orders API"
```

El script usa `NODE_ENV=test`: la aplicación lee `.env.test` en lugar de `.env` y el logger queda en silencio, para no mezclar sus mensajes con el resultado de los tests.

### Cómo están organizados

```txt
tests/
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

### Aislamiento de los tests

- Usan una **base de datos de testing separada**. Antes de empezar, el `setup` se niega a correr si el nombre de la base no contiene `test`, para que nunca se limpien los datos de desarrollo.
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

3. Crear un archivo `.env` en la raíz a partir de `.env.example`, completando:

```env
PORT=8080
MONGODB_URI=<tu-connection-string-de-mongodb-atlas>
NODE_ENV=development
```

4. Levantar el servidor en modo desarrollo:

```bash
npm run dev
```

5. La API queda disponible en `http://localhost:8080`.

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

Todavía no incorpora:

```txt
Multer
Docker
```

Durante el curso, la API será mejorada progresivamente para separar responsabilidades, mejorar la mantenibilidad y acercarse a una estructura más profesional.
