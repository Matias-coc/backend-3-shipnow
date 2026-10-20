import logger from '../config/logger.js';
import { createError, errorResponse } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

export function errorHandler(error, req, res, next) {
  let handledError = error;

  if (error.name === 'CastError') {
    handledError = createError(ERROR_CODES.INVALID_ID_MONGOOSE);
  }

  if (error.code === 11000) {
    handledError = createError(ERROR_CODES.DUPLICATE_KEY_ERROR);
  }

  const context = { method: req.method, path: req.originalUrl };

  if (!handledError.statusCode) {
    logger.error(error.message, { ...context, stack: error.stack });
    handledError = createError(ERROR_CODES.INTERNAL_SERVER_ERROR);
  } else if (handledError.statusCode >= 500) {
    logger.error(handledError.message, { ...context, code: handledError.code });
  } else {
    
    logger.warning(handledError.message, { ...context, code: handledError.code });
  }

  return errorResponse(res, {
    statusCode: handledError.statusCode,
    message: handledError.message,
    code: handledError.code,
  });
}