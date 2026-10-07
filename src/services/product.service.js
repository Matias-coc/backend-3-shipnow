import productRepository from "../repositories/product.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";
import { createError } from "../errors/apiResponse.js";
import { ERROR_CODES } from "../errors/errorDictionary.js";

const getAllProducts = async () => {
  return await productRepository.getAll();
};

const getProductById = async (id) => {
  const product = await productRepository.getById(id);
  if (!product) {
    throw createError(ERROR_CODES.PRODUCT_NOT_FOUND);
  }
  return product;
};

const resolveStatus = (stock) => {
  return stock <= 0 ? PRODUCT_STATUS.OUT_OF_STOCK : PRODUCT_STATUS.AVAILABLE;
};

const createProduct = async (data) => {
  const { name, price, stock, store } = data;
  if (!name || price == null || stock == null || !store) {
    throw createError(ERROR_CODES.VALIDATION_ERROR);
  }
  const status = resolveStatus(stock);

    return await productRepository.create({ name, price, stock, status, store });
}


const updateProduct = async (id, data) => {
  const updateData = { ...data };
  if (data.stock !== undefined) {
    updateData.status = resolveStatus(updateData.stock);
  }
  const product = await productRepository.update(id, updateData);
  if (!product) {
    throw createError(ERROR_CODES.PRODUCT_NOT_FOUND);
  }

  return product;
};

const deleteProduct = async (id) => {
  const product = await productRepository.remove(id);
  if (!product) {
    throw createError(ERROR_CODES.PRODUCT_NOT_FOUND);
  }
  return product;
};

export default {
  getAllProducts,
  getProductById,
  resolveStatus,
  createProduct,
  updateProduct,
  deleteProduct
};
