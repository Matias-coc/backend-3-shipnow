import mocksService from '../services/mocks.service.js';
import { successResponse } from '../errors/apiResponse.js';

const getMockUsers = async (req, res,next) => {
    try {
        const { qty } = req.query;
        const users = await mocksService.generateUsers(qty);
        successResponse(res, { message: 'Usuarios de prueba generados', payload: users });
    } catch (error) {
        next(error);
    }
};

const getMockOrders = async (req, res,next) => {
    try {
        const { qty } = req.query;
        const orders = await mocksService.generateOrders(qty);
        successResponse(res, { message: 'Pedidos de prueba generados', payload: orders });
    } catch (error) {
        next(error);
    }
};


const generateData = async (req, res,next) => {
    try {
        const { users, stores, drivers, orders, deliveries } = req.body;
        const result = await mocksService.generateData({ users, stores, drivers, orders, deliveries });
        successResponse(res, { message: 'Datos de prueba generados y guardados', payload: result });
    } catch (error) {
        next(error);
    }
};

export default { getMockUsers, getMockOrders, generateData };