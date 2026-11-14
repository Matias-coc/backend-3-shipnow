import fs from 'fs/promises';
import logger from '../config/logger.js';

// Arma los metadatos que se guardan en MongoDB a partir del archivo que procesó Multer.
// Solo se guarda la referencia: el archivo vive en la carpeta uploads/ del servidor.
export const buildFileMetadata = (file, type) => ({
  originalName: file.originalname,
  fileName: file.filename,
  path: file.path.replace(/\\/g, '/'),
  mimeType: file.mimetype,
  size: file.size,
  type,
  uploadedAt: new Date(),
});

// Borra un archivo del disco. Se usa para no dejar archivos "huérfanos" cuando la operación falla.
export const removeFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warning('No se pudo eliminar el archivo', { path: filePath, reason: error.message });
    }
  }
};
