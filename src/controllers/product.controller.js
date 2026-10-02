import productService from "../services/product.service.js";

const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ status: "success", payload: products });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productService.getProductById(pid);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productService.updateProduct(pid, req.body);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productService.deleteProduct(pid);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    res.status(200).json({ status: "success", message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export default {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
