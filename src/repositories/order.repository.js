import Order from '../models/order.model.js';

const getAll = async () => {
    return await Order.find().populate('customer').populate('store');
}

const getById = async (id) => {
    return await Order.findById(id).populate('customer').populate('store');
}

const create = async (data) => {
    return await Order.create(data);
}   

const updateStatus = async (id, status) => {
    return await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
}

const remove = async (id) => {
    return await Order.findByIdAndDelete(id);
}

const insertMany = async (data) => {
    return await Order.insertMany(data);
}

export default { getAll, getById, create, updateStatus, remove, insertMany };