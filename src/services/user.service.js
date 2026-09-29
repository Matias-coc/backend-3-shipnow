import userRepository from '../repositories/user.repository.js';

const getAllUsers = async () => {
    return await userRepository.getAll();
};

const createUser = async (data) => {
    return await userRepository.create(data);
};

const getUserById = async (id) => {
    return await userRepository.getById(id);
};

const updateUser = async (id, data) => {
    return await userRepository.update(id, data);
};

const deleteUser = async (id) => {
    return await userRepository.remove(id);
};

export default { getAllUsers, createUser, getUserById, updateUser, deleteUser };