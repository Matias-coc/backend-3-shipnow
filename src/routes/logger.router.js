import { Router } from 'express';
import LoggerController from '../controllers/logger.controller.js';

const router = Router();

router.get('/', LoggerController.loggerTest);

export default router;