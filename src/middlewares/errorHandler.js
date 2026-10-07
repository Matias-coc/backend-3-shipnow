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

  return errorResponse(res, {
    statusCode: handledError.statusCode,
    message: handledError.message,
    code: handledError.code,
  });
}