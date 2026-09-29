import orderRepository from '../repositories/order.repository.js';
import userRepository from '../repositories/user.repository.js';
import storeRepository from '../repositories/store.repository.js';

const getAllOrders = async () => {
    return await orderRepository.getAll();
}

const getOrderById = async (id) => {
    return await orderRepository.getById(id);
}

const createOrder = async (data) => {
    const { customer, store, items, deliveryAddress, priority} = data;
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('El pedido debe contener al menos un producto.');
    }

    const customerFound = await userRepository.getById(customer);
    if (!customerFound) {
        throw new Error('Usuario no encontrado.');
    }
    
    const storeFound = await storeRepository.getById(store);
    if (!storeFound) {
        throw new Error('Comercio no encontrado.');
    }

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return await orderRepository.create({ customer, store, items, deliveryAddress, priority, total });
}

const updateOrderStatus = async (id, status) => {
    return await orderRepository.updateStatus(id, status);
}

const deleteOrder = async (id) => {
    return await orderRepository.remove(id);
}

export default { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder };