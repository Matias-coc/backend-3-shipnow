import storeService from '../services/store.service.js';

const getStores = async (req, res) => {
    try {
    const stores = await storeService.getAllStores();
    res.status(200).json({ status: 'success', payload: stores });
} catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
}
};

const getStore = async (req, res) => {
    try {
        const { sid } = req.params;
        const store = await storeService.getStoreById(sid);
        if (!store) {
            return res.status(404).json({ status: 'error', message: 'Store not found' });
        }
        res.status(200).json({ status: 'success', payload: store });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
    
};

const createStore = async (req, res) => {
    try {
        const store = await storeService.createStore(req.body);
        res.status(201).json({ status: 'success', payload: store });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const updateStore = async (req, res) => {
    try {
        const { sid } = req.params;
        const store = await storeService.updateStore(sid, req.body);
        if (!store) {
            return res.status(404).json({ status: 'error', message: 'Store not found' });
        }
        res.status(200).json({ status: 'success', payload: store });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const deleteStore = async (req, res) => {
    try { 
        const { sid } = req.params;
        const store = await storeService.deleteStore(sid);

    if (!store) {
        return res.status(404).json({ status: 'error', message: 'Store not found' });
    }
    res.status(200).json({ status: 'success', payload: store });
} catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
}}

export default { getStores, getStore, createStore, updateStore, deleteStore };