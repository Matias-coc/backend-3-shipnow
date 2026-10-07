import orderService from '../services/order.service.js';
import { successResponse } from '../errors/apiResponse.js';

const getOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders();
        successResponse(res, { message: 'Lista de pedidos', payload: orders });
    } catch (error) {
        next(error);
    }
};

const getOrder = async (req, res, next) => {
    try {
    const { oid } = req.params;
    const order = await orderService.getOrderById(oid);
    successResponse(res, { message: 'Pedido encontrado', payload: order });
} catch (error) {
    next(error);
}
};

const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.body);
        successResponse(res, { statusCode: 201, message: 'Pedido creado', payload: order });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { oid } = req.params;
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(oid, status);
        successResponse(res, { message: 'Estado del pedido actualizado', payload: order });
    } catch (error) {
        next(error);
    }
};

const deleteOrder = async (req, res, next) => {
    try {
        const { oid } = req.params;
        const order = await orderService.deleteOrder(oid);
        successResponse(res, { message: 'Pedido eliminado', payload: order });
    } catch (error) {
        next(error);
    }
};

export default { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };