import storeService from '../services/store.service.js';
import { successResponse } from '../errors/apiResponse.js';

const getStores = async (req, res, next) => {
    try {
    const stores = await storeService.getAllStores();
    successResponse(res, { message: 'Lista de tiendas', payload: stores });
} catch (error) {
    next(error);
}
};

const getStore = async (req, res, next) => {
    try {
        const { sid } = req.params;
        const store = await storeService.getStoreById(sid);
        successResponse(res, { message: 'Tienda encontrada', payload: store });
    } catch (error) {
        next(error);
    }
    
};

const createStore = async (req, res, next) => {
    try {
        const store = await storeService.createStore(req.body);
        successResponse(res, { statusCode: 201, message: 'Tienda creada', payload: store });
    } catch (error) {
        next(error);
    }
};

const updateStore = async (req, res, next) => {
    try {
        const { sid } = req.params;
        const store = await storeService.updateStore(sid, req.body);
        successResponse(res, { message: 'Tienda actualizada', payload: store });
    } catch (error) {
        next(error);
    }
};

const deleteStore = async (req, res, next) => {
    try { 
        const { sid } = req.params;
        const store = await storeService.deleteStore(sid);
        successResponse(res, { message: 'Tienda eliminada', payload: store });
} catch (error) {
    next(error);
}}

export default { getStores, getStore, createStore, updateStore, deleteStore };