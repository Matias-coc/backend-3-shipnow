import deliveryService from '../services/delivery.service.js';
import { successResponse } from '../errors/apiResponse.js';

const getDeliveries = async (req, res, next) => {
    try {
        const deliveries = await deliveryService.getAllDeliveries();
        successResponse(res, { message: 'Lista de entregas', payload: deliveries });
    } catch (error) {
        next(error);
    }
};

const getDelivery = async (req, res, next) => {
    try {
        const { did } = req.params;
        const delivery = await deliveryService.getDeliveryById(did);
        successResponse(res, { message: 'Entrega encontrada', payload: delivery });
    } catch (error) {
        next(error);
    }
};

const createDelivery = async (req, res, next) => {
    try {
        const delivery = await deliveryService.createDelivery(req.body);
        successResponse(res, { statusCode: 201, message: 'Entrega creada', payload: delivery });
    } catch (error) {
        next(error);
    }
};

const updateDeliveryStatus = async (req, res, next) => {
    try {
        const { did } = req.params;
        const { status } = req.body;
        const delivery = await deliveryService.updateDeliveryStatus(did, status);
        successResponse(res, { message: 'Estado de entrega actualizado', payload: delivery });
    } catch (error) {
        next(error);
    }
};

const deleteDelivery = async (req, res, next) => {
    try {
        const { did } = req.params;
        const delivery = await deliveryService.deleteDelivery(did);
        successResponse(res, { message: 'Entrega eliminada', payload: delivery });
    } catch (error) {
        next(error);
    }
};

export default { getDeliveries, getDelivery, createDelivery, updateDeliveryStatus, deleteDelivery };