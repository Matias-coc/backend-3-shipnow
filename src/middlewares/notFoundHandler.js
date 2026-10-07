import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

export function notFoundHandler(req, res, next) {
  next(createError(ERROR_CODES.ROUTE_NOT_FOUND));
}