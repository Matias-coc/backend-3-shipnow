import multer from 'multer';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import logger from '../config/logger.js';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  FILE_FIELDS,
  UPLOAD_FOLDERS,
  FOLDER_BY_DOCUMENT_TYPE,
  USER_DOCUMENT_TYPES,
} from '../constants/index.js';

const userDocumentFolder = (req) => {
  const type = req.body?.type;
  return USER_DOCUMENT_TYPES.includes(type) ? FOLDER_BY_DOCUMENT_TYPE[type] : UPLOAD_FOLDERS.DOCUMENTS;
};
const orderProofFolder = () => UPLOAD_FOLDERS.PROOFS;

const createStorage = (resolveFolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = resolveFolder(req);
      fs.promises.mkdir(folder, { recursive: true }).then(() => cb(null, folder), cb);
    },
    filename: (req, file, cb) => {
      const extension = ALLOWED_FILE_TYPES[file.mimetype] ?? path.extname(file.originalname);
      cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
  });

const fileFilter = (req, file, cb) => {
  if (Object.hasOwn(ALLOWED_FILE_TYPES, file.mimetype)) {
    return cb(null, true);
  }
  logger.warning('Intento de carga con tipo de archivo no permitido', {
    mimeType: file.mimetype,
    originalName: file.originalname,
    path: req.originalUrl,
  });
  cb(createError(ERROR_CODES.INVALID_FILE_TYPE));
};

const adaptUploadError = (error, req) => {
  if (error instanceof multer.MulterError) {
    const context = { path: req.originalUrl, multerCode: error.code, field: error.field };
    if (error.code === 'LIMIT_FILE_SIZE') {
      logger.warning('Intento de carga de un archivo que supera el tamaño máximo', context);
      return createError(ERROR_CODES.FILE_TOO_LARGE);
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      logger.warning('Carga rechazada: el campo del archivo no es el esperado', context);
      return createError(ERROR_CODES.INVALID_FILE_FIELD);
    }
    logger.error('Error de Multer al subir un archivo', { ...context, message: error.message });
    return createError(ERROR_CODES.UPLOAD_ERROR);
  }

  if (error.statusCode) return error;

  logger.error('Error al guardar el archivo en el servidor', { path: req.originalUrl, message: error.message });
  return createError(ERROR_CODES.UPLOAD_ERROR);
};

const createSingleUpload = (fieldName, resolveFolder) => {
  const upload = multer({
    storage: createStorage(resolveFolder),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (error) => {
      if (error) return next(adaptUploadError(error, req));
      next();
    });
  };
};

export const uploadUserDocument = createSingleUpload(FILE_FIELDS.USER_DOCUMENT, userDocumentFolder);
export const uploadOrderProof = createSingleUpload(FILE_FIELDS.ORDER_PROOF, orderProofFolder);
