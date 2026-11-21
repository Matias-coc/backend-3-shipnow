import mongoose from 'mongoose';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import { PAGINATION } from '../constants/index.js';

const parsePositiveInt = (value, defaultValue) => {
  if (value === undefined || value === '') return defaultValue;
  // Solo se aceptan strings con dígitos: descarta arrays (?page=1&page=2), objetos y decimales
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw createError(ERROR_CODES.INVALID_PAGINATION);
  }
  const number = Number(value);
  if (number < 1) throw createError(ERROR_CODES.INVALID_PAGINATION);
  return number;
};

export const parsePagination = (query = {}) => {
  const page = parsePositiveInt(query.page, PAGINATION.DEFAULT_PAGE);
  const limit = parsePositiveInt(query.limit, PAGINATION.DEFAULT_LIMIT);
  if (limit > PAGINATION.MAX_LIMIT) {
    throw createError(ERROR_CODES.INVALID_PAGINATION);
  }
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPagination = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit);
  return { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
};

export const parseEnumFilter = (value, allowedValues, errorCode) => {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || !allowedValues.includes(value)) {
    throw createError(errorCode);
  }
  return value;
};

export const parseIdFilter = (value) => {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
    throw createError(ERROR_CODES.INVALID_ID_MONGOOSE);
  }
  return value;
};

export const compactFilter = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value !== undefined));
