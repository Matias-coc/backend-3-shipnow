export const ERROR_CODES = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_ID_MONGOOSE: "INVALID_ID_MONGOOSE",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  STORE_NOT_FOUND: "STORE_NOT_FOUND",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  INVALID_ORDER_STATUS: "INVALID_ORDER_STATUS",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  INVALID_MOCK_AMOUNT: "INVALID_MOCK_AMOUNT",
  DUPLICATE_KEY_ERROR: "DUPLICATE_KEY_ERROR",
};

export const ERROR_DICTIONARY = {
  INTERNAL_SERVER_ERROR: { statusCode: 500, message: "Error interno en el servidor" },
  ROUTE_NOT_FOUND: { statusCode: 404, message: "Ruta no encontrada" },
  VALIDATION_ERROR: { statusCode: 400, message: "Faltan datos obligatorios" },
  INVALID_ID_MONGOOSE: { statusCode: 400, message: "ID inválido" },
  USER_NOT_FOUND: { statusCode: 404, message: "Usuario no encontrado" },
  STORE_NOT_FOUND: { statusCode: 404, message: "Comercio no encontrado" },
  ORDER_NOT_FOUND: { statusCode: 404, message: "Pedido no encontrado" },
  INVALID_ORDER_STATUS: { statusCode: 400, message: "Estado de pedido inválido" },
  PRODUCT_NOT_FOUND: { statusCode: 404, message: "Producto no encontrado" },
  INVALID_MOCK_AMOUNT: { statusCode: 400, message: "La cantidad solicitada no es válida" },
  DUPLICATE_KEY_ERROR: { statusCode: 409, message: "Ya existe un registro con ese valor único (por ejemplo, el email)" },
};