import storeRepository from '../repositories/store.repository.js';

const getAllStores = async () => {
    return await storeRepository.getAll();
};

const getStoreById = async (id) => {
    return await storeRepository.getById(id);
};

const createStore = async (data) => {
    return await storeRepository.create(data);
};

const updateStore = async (id, data) => {
    return await storeRepository.update(id, data);
};

const deleteStore = async (id) => {
    return await storeRepository.remove(id);
};

export default { getAllStores, getStoreById, createStore, updateStore, deleteStore };