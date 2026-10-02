import mocksService from '../services/mocks.service.js';

const getMockUsers = async (req, res) => {
    try {
        const { qty } = req.query;
        const users = await mocksService.generateUsers(qty);
        res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const getMockOrders = async (req, res) => {
    try {
        const { qty } = req.query;
        const orders = await mocksService.generateOrders(qty);
        res.status(200).json({ status: 'success', payload: orders });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const generateData = async (req, res) => {
    try {
        const { users, stores, drivers, orders, deliveries } = req.body;
        const result = await mocksService.generateData({ users, stores, drivers, orders, deliveries });
        res.status(200).json({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export default { getMockUsers, getMockOrders, generateData };