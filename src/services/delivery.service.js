import deliveryRepository from '../repositories/delivery.repository.js';
import orderRepository from '../repositories/order.repository.js';
import userRepository from '../repositories/user.repository.js';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import { USER_ROLES, DRIVER_STATUS } from '../constants/index.js';

const getAllDeliveries = async () => {
    return await deliveryRepository.getAll();
};

const getDeliveryById = async (id) => {
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) {
        throw createError(ERROR_CODES.DELIVERY_NOT_FOUND);
    }
    return delivery;
};

const createDelivery = async (data) => {
    const { order, driver, priority, notes } = data;

    if (!order || !driver) {
        throw createError(ERROR_CODES.VALIDATION_ERROR);
    }
    const orderFound = await orderRepository.getById(order);
    if (!orderFound) {
        throw createError(ERROR_CODES.ORDER_NOT_FOUND);
    }
    const userFound = await userRepository.getById(driver);
    if (!userFound) {
        throw createError(ERROR_CODES.USER_NOT_FOUND);
    }
    if (userFound.role !== USER_ROLES.DRIVER) {
        throw createError(ERROR_CODES.INVALID_DRIVER);
    }
    if (!userFound.isAvailable) {
        throw createError(ERROR_CODES.DRIVER_NOT_AVAILABLE);
    }
    const deliveryFound = await deliveryRepository.getByOrder(order);
    if (deliveryFound) {
        throw createError(ERROR_CODES.DELIVERY_ALREADY_ASSIGNED);
    }
    return await deliveryRepository.create({ order, driver, priority, notes });
};

const updateDeliveryStatus = async (id, status) => {
    if (!Object.values(DRIVER_STATUS).includes(status)) {
        throw createError(ERROR_CODES.INVALID_DELIVERY_STATUS);
    }
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) {
        throw createError(ERROR_CODES.DELIVERY_NOT_FOUND);
    }
    const updatedDelivery = await deliveryRepository.updateStatus(id, status);
    return updatedDelivery;
};

const deleteDelivery = async (id) => {
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) {
        throw createError(ERROR_CODES.DELIVERY_NOT_FOUND);
    }
    return await deliveryRepository.delete(id);
};

export default { getAllDeliveries, getDeliveryById, createDelivery, updateDeliveryStatus, deleteDelivery };