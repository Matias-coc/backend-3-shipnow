import { ERROR_CODES, ERROR_DICTIONARY } from './errorDictionary.js';

export const successResponse = (res, { statusCode = 200, message = '', payload = {} }) => {
  return res.status(statusCode).json({ status: 'success', message, payload });
};

export const createError = (code) => {
  const isInDictionary = code in ERROR_DICTIONARY;
  const activeCode = isInDictionary ? code : ERROR_CODES.INTERNAL_SERVER_ERROR;
  const configError = ERROR_DICTIONARY[activeCode];

  const error = new Error(configError.message);
  error.statusCode = configError.statusCode;
  error.code = activeCode;

  return error;
};

export const errorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || ERROR_DICTIONARY[ERROR_CODES.INTERNAL_SERVER_ERROR].message;
  const code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json({ status: 'error', message, code });
};