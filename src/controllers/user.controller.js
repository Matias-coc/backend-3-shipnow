import userService from '../services/user.service.js';
import { successResponse } from '../errors/apiResponse.js';

const getUsers = async (req, res, next) => {
    try {
        const { items, pagination } = await userService.getAllUsers(req.query);
        successResponse(res, { message: 'Lista de usuarios', payload: items, pagination });
    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const user = await userService.getUserById(uid);
        successResponse(res, { message: 'Usuario encontrado', payload: user });
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        successResponse(res, { statusCode: 201, message: 'Usuario creado', payload: user });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const user = await userService.updateUser(uid, req.body);
        successResponse(res, { message: 'Usuario actualizado', payload: user });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const user = await userService.deleteUser(uid);
        successResponse(res, { message: 'Usuario eliminado', payload: user });
    } catch (error) {
        next(error);
    }
};

const uploadDocument = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const { type } = req.body;
        const document = await userService.addDocument(uid, req.file, type);
        successResponse(res, { message: 'Documento cargado', payload: document });
    } catch (error) {
        next(error);
    }
};

export default { getUsers, getUser, createUser, updateUser, deleteUser, uploadDocument };