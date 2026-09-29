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
  "message": "API funcionando correctamente"
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

Respuesta esperada:

```json
{
  "status": "success",
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

---

## Formato general de respuestas

Las respuestas exitosas siguen una estructura simple:

```json
{
  "status": "success",
  "payload": {}
}
```

Las respuestas de error se manejan con `try/catch` dentro de cada método del Controller, devolviendo el status code correspondiente (400 para errores de validación/negocio, 404 cuando un recurso no existe):

```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

Más adelante, el proyecto será refactorizado para incorporar una capa centralizada de manejo de errores.

## Instalación y ejecución

1. Clonar el repositorio y entrar a la carpeta del proyecto.
2. Instalar dependencias:

npm install

3. Crear un archivo `.env` en la raíz a partir de `.env.example`, completando:

PORT=8080
MONGODB_URI=<tu-connection-string-de-mongodb-atlas>
NODE_ENV=development

4. Levantar el servidor en modo desarrollo:

npm run dev

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

app.js
server.js
models
controllers
services
repositories
routes
config/db.js
config/env.config.js
constants/index.js


La configuración de entorno (`PORT`, `MONGODB_URI`, `NODE_ENV`) se valida al arranque: si falta alguna variable crítica, la aplicación no inicia y muestra un error descriptivo. Los roles de usuario, estados y prioridad de los pedidos están centralizados como constantes inmutables (`Object.freeze`) en `constants/index.js`.

Todavía no incorpora:

middleware global de errores
logger profesional
Swagger
tests automatizados
Multer
Docker


Durante el curso, la API será mejorada progresivamente para separar responsabilidades, mejorar la mantenibilidad y acercarse a una estructura más profesional.
