import User from '../models/user.model.js';

const getAll = async () => {
    return await User.find();
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