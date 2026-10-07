import userRepository from '../repositories/user.repository.js';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

const getAllUsers = async () => {
    return await userRepository.getAll();
};

const getUserById = async (id) => {
    const user = await userRepository.getById(id);
    if (!user) {
        throw createError(ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
};

const createUser = async (data) => {
    const { firstName, lastName, email, password } = data;
    if (!firstName || !lastName || !email || !password) {
        throw createError(ERROR_CODES.VALIDATION_ERROR);
    }
    return await userRepository.create(data);
};

const updateUser = async (id, data) => {
    const user = await userRepository.getById(id);
    if (!user) {
        throw createError(ERROR_CODES.USER_NOT_FOUND);
    }
    return await userRepository.update(id, data);
};

const deleteUser = async (id) => {
    const user = await userRepository.getById(id);
    if (!user) {
        throw createError(ERROR_CODES.USER_NOT_FOUND);
    }
    return await userRepository.remove(id);
};

export default { getAllUsers, createUser, getUserById, updateUser, deleteUser };