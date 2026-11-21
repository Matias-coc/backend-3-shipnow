import orderRepository from '../repositories/order.repository.js';
import userRepository from '../repositories/user.repository.js';
import storeRepository from '../repositories/store.repository.js';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import { ORDER_STATUS, PRIORITY_LEVELS, DOCUMENT_TYPES } from '../constants/index.js'
import { parsePagination, buildPagination, parseEnumFilter, parseIdFilter, compactFilter } from '../utils/query.utils.js';
import { buildFileMetadata, removeFile } from '../utils/file.utils.js';
import logger from '../config/logger.js';

const getAllOrders = async (query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const filter = compactFilter({
        status: parseEnumFilter(query.status, Object.values(ORDER_STATUS), ERROR_CODES.INVALID_ORDER_STATUS),
        priority: parseEnumFilter(query.priority, Object.values(PRIORITY_LEVELS), ERROR_CODES.INVALID_DATA),
        customer: parseIdFilter(query.customer),
        store: parseIdFilter(query.store),
    });

    const { items, total } = await orderRepository.getAll({ filter, skip, limit });
    return { items, pagination: buildPagination({ page, limit, total }) };
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

    const order = await orderRepository.create({ customer, store, items, deliveryAddress, total, priority });

    logger.info(`Pedido creado con ID`, { orderId: order._id, total });

    return order;
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

const addProof = async (id, file) => {
    if (!file) {
        throw createError(ERROR_CODES.FILE_REQUIRED);
    }

    // Si algo falla después de que Multer guardó el archivo, se borra para no dejarlo huérfano
    try {
        const order = await orderRepository.getById(id);
        if (!order) {
            throw createError(ERROR_CODES.ORDER_NOT_FOUND);
        }

        const previousProofPath = order.proof?.path;
        const proof = buildFileMetadata(file, DOCUMENT_TYPES.DELIVERY_PROOF);
        const updatedOrder = await orderRepository.setProof(id, proof);

        // Si el pedido ya tenía comprobante, el anterior queda reemplazado y se elimina del disco
        if (previousProofPath) {
            await removeFile(previousProofPath);
        }

        logger.info('Comprobante asociado al pedido', { orderId: id, fileName: proof.fileName, size: proof.size });

        return updatedOrder;
    } catch (error) {
        await removeFile(file.path);
        logger.warning('No se pudo asociar el comprobante al pedido', { orderId: id, code: error.code, reason: error.message });
        throw error;
    }
};

export default { getAllOrders, getOrderById, createOrder, updateOrderStatus, addProof, deleteOrder };