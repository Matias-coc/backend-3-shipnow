import orderService from '../services/order.service.js';

const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json({ status: 'success', payload: orders });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const getOrder = async (req, res) => {
    try {
    const { oid } = req.params;
    const order = await orderService.getOrderById(oid);
    if (!order) {
        return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    res.status(200).json({ status: 'success', payload: order });
} catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
}
};

const createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(req.body);
        res.status(201).json({ status: 'success', payload: order });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { oid } = req.params;
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(oid, status);
        res.status(200).json({ status: 'success', payload: order });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { oid } = req.params;
        const order = await orderService.deleteOrder(oid);
        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }
        res.status(200).json({ status: 'success', message: 'Order deleted' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export default { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };