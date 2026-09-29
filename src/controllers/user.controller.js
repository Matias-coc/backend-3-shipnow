import userService from '../services/user.service.js';

const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userService.getUserById(uid);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ status: 'success', payload: user });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userService.updateUser(uid, req.body);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userService.deleteUser(uid);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export default { getUsers, getUser, createUser, updateUser, deleteUser };