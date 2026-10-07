import orderRepository from '../repositories/order.repository.js';
import userRepository from '../repositories/user.repository.js';
import storeRepository from '../repositories/store.repository.js';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import { ORDER_STATUS } from '../constants/index.js'

const getAllOrders = async () => {
    return await orderRepository.getAll();
}

const getOrderById = async (id) => {
    const order = await orderRepository.getById(id);
    if (!order) {
        throw createError(ERROR_CODES.ORDER_NOT_FOUND);
    }
    return order;
}

const createOrder = async (data) => {
    const { customer, store, items, deliveryAddress, priority} = data;
    if (!customer || !store || !items || !deliveryAddress) {
    throw createError(ERROR_CODES.VALIDATION_ERROR);
    }
    if (!Array.isArray(items) || items.length === 0) {
        throw createError(ERROR_CODES.VALIDATION_ERROR);
    }

    const customerFound = await userRepository.getById(customer);
    if (!customerFound) {
        throw createError(ERROR_CODES.USER_NOT_FOUND);
    }
    
    
    const storeFound = await storeRepository.getById(store);
    if (!storeFound) {
        throw createError(ERROR_CODES.STORE_NOT_FOUND);
    }

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return await orderRepository.create({ customer, store, items, deliveryAddress, priority, total });
};

const updateOrderStatus = async (id, status) => {
    if (!Object.values(ORDER_STATUS).includes(status)) {
        throw createError(ERROR_CODES.INVALID_ORDER_STATUS);
    }
    const order = await orderRepository.getById(id);
    if (!order) {
        throw createError(ERROR_CODES.ORDER_NOT_FOUND);
    }
    return await orderRepository.updateStatus(id, status);
}

const deleteOrder = async (id) => {
    const order = await orderRepository.getById(id);
    if (!order) {
        throw createError(ERROR_CODES.ORDER_NOT_FOUND);
    }
    return await orderRepository.remove(id);
}

export default { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder };