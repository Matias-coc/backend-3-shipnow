import Store from '../models/store.model.js';

const getAll = async () => {
    return await Store.find();
};

const create = async (data) => {
    return await Store.create(data);
};

const getById = async (id) => {
    return await Store.findById(id);  
};

const update = async (id, data) => {    
    return await Store.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const remove = async (id) => {
    return await Store.findByIdAndDelete(id);
};

export default { getAll, create, getById, update, remove };