import Product from "../models/product.model.js";

const getAll = async () => {
  return await Product.find();
};

const getById = async (id) => {
  return await Product.findById(id);
};

const create = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

const update = async (id, productData) => {
  return await Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true });
};

const remove = async (id) => {
  return await Product.findByIdAndDelete(id);
};

const insertMany = async (products) => {
  return await Product.insertMany(products);
}

export default { getAll, getById, create, update, remove, insertMany };