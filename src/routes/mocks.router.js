import { Router } from 'express';
import MocksController from '../controllers/mocks.controller.js';

const router = Router();

router.get('/mockingusers', MocksController.getMockUsers);
router.get('/mockingorders', MocksController.getMockOrders);
router.post('/generateData', MocksController.generateData);

export default router;