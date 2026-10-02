import productRepository from "../repositories/product.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";

const getAllProducts = async () => {
  return await productRepository.getAll();
};

const getProductById = async (id) => {
  return await productRepository.getById(id);
};

const resolveStatus = (stock) => {
  return stock <= 0 ? PRODUCT_STATUS.OUT_OF_STOCK : PRODUCT_STATUS.AVAILABLE;
};

const createProduct = async (data) => {
  const { name, price, stock, store } = data;
  if (!name || price == null || stock == null || !store) {
    throw new Error("Todos los campos son obligatorios.");
  }

  const status = resolveStatus(stock);

    return await productRepository.create({ name, price, stock, status, store });
};

const updateProduct = async (id, data) => {
  const updateData = { ...data };
  if (data.stock !== undefined) {
    updateData.status = resolveStatus(updateData.stock);
  }

  return await productRepository.update(id, updateData);
};

const deleteProduct = async (id) => {
  return await productRepository.remove(id);
};

export default {
  getAllProducts,
  getProductById,
  resolveStatus,
  createProduct,
  updateProduct,
  deleteProduct
};
