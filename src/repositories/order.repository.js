import Order from '../models/order.model.js';

const getAll = async ({ filter = {}, skip = 0, limit = 10 } = {}) => {
    const [items, total] = await Promise.all([
        Order.find(filter).sort({ _id: 1 }).skip(skip).limit(limit).populate('customer').populate('store'),
        Order.countDocuments(filter),
    ]);
    return { items, total };
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

const setProof = async (id, proof) => {
    return await Order.findByIdAndUpdate(id, { proof }, { new: true, runValidators: true });
}

const remove = async (id) => {
    return await Order.findByIdAndDelete(id);
}

const insertMany = async (data) => {
    return await Order.insertMany(data);
}

export default { getAll, getById, create, updateStatus, setProof, remove, insertMany };