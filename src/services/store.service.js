import storeRepository from '../repositories/store.repository.js';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

const getAllStores = async () => {
    return await storeRepository.getAll();
};

const getStoreById = async (id) => {
    const store = await storeRepository.getById(id);
    if (!store) {
        throw createError(ERROR_CODES.STORE_NOT_FOUND);
    }
    return store;
};

const createStore = async (data) => {
    const { name, address, owner } = data;
    if (!name || !address || !owner) {
        throw createError(ERROR_CODES.VALIDATION_ERROR);
    }
    return await storeRepository.create({ name, address, owner });
};

const updateStore = async (id, data) => {
    const store = await storeRepository.getById(id);
    if (!store) {
        throw createError(ERROR_CODES.STORE_NOT_FOUND);
    }
    return await storeRepository.update(id, data);
};

const deleteStore = async (id) => {
    const store = await storeRepository.getById(id);
    if (!store) {
        throw createError(ERROR_CODES.STORE_NOT_FOUND);
    }
    return await storeRepository.remove(id);
};

export default { getAllStores, getStoreById, createStore, updateStore, deleteStore };