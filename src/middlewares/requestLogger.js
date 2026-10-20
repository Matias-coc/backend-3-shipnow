import logger from '../config/logger.js';

export function requestLogger(req, res, next) {
  res.on('finish', () => {
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
}