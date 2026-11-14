import userRepository from '../repositories/user.repository.js';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import { USER_DOCUMENT_TYPES, DOCUMENT_TYPES, USER_ROLES } from '../constants/index.js';
import { buildFileMetadata, removeFile } from '../utils/file.utils.js';
import logger from '../config/logger.js';

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

const addDocument = async (id, file, type) => {
    if (!file) {
        throw createError(ERROR_CODES.FILE_REQUIRED);
    }

    // Si algo falla después de que Multer guardó el archivo, se borra para no dejarlo huérfano
    try {
        if (!USER_DOCUMENT_TYPES.includes(type)) {
            throw createError(ERROR_CODES.INVALID_DOCUMENT_TYPE);
        }

        const user = await userRepository.getById(id);
        if (!user) {
            throw createError(ERROR_CODES.USER_NOT_FOUND);
        }

        if (type === DOCUMENT_TYPES.DRIVER_LICENSE && user.role !== USER_ROLES.DRIVER) {
            throw createError(ERROR_CODES.INVALID_DRIVER);
        }

        const document = buildFileMetadata(file, type);
        await userRepository.addDocument(id, document);

        logger.info('Documento de usuario cargado', { userId: id, type, fileName: document.fileName, size: document.size });

        return document;
    } catch (error) {
        await removeFile(file.path);
        logger.warning('No se pudo asociar el documento al usuario', { userId: id, type, code: error.code, reason: error.message });
        throw error;
    }
};

export default { getAllUsers, createUser, getUserById, updateUser, deleteUser, addDocument };