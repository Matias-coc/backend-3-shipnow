import productService from "../services/product.service.js";
import { successResponse } from "../errors/apiResponse.js";

const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    successResponse(res, { message: "Lista de productos", payload: products });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const product = await productService.getProductById(pid);
    successResponse(res, { message: "Producto encontrado", payload: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    successResponse(res, { statusCode: 201, message: "Producto creado", payload: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const product = await productService.updateProduct(pid, req.body);
    successResponse(res, { message: "Producto actualizado", payload: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const product = await productService.deleteProduct(pid);
    successResponse(res, { message: "Producto eliminado", payload: product });
  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
