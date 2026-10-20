import logger from '../config/logger.js';
import { successResponse } from '../errors/apiResponse.js';

const loggerTest = (req, res) => {
  logger.debug('Este es un log de nivel debug');
  logger.info('Este es un log de nivel info');
  logger.warning('Este es un log de nivel warning');
  logger.error('Este es un log de nivel error');
  logger.http('Este es un log de nivel http');
  logger.fatal('Este es un log de nivel fatal');

  successResponse(res, { message: 'Logs generados correctamente' });
};

export default { loggerTest };