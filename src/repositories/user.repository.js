import User from '../models/user.model.js';

const getAll = async ({ filter = {}, skip = 0, limit = 10 } = {}) => {
    const [items, total] = await Promise.all([
        User.find(filter).sort({ _id: 1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
    ]);
    return { items, total };
};

const create = async (data) => {
    return await User.create(data);
}

const getById = async (id) => {
    return await User.findById(id);
}

const update = async (id, data) => {
    return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

const remove = async (id) => {
    return await User.findByIdAndDelete(id);
}

const addDocument = async (id, document) => {
    return await User.findByIdAndUpdate(id, { $push: { documents: document } }, { new: true, runValidators: true });
}

const insertMany = async (data) => {
    return await User.insertMany(data);
}

export default { getAll, create, getById, update, remove, addDocument, insertMany };