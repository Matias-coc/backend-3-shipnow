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

export default { getAll, create, getById, update, remove };