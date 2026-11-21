import Delivery from "../models/delivery.model.js";

const getAll = async ({ filter = {}, skip = 0, limit = 10 } = {}) => {
  const [items, total] = await Promise.all([
    Delivery.find(filter).sort({ _id: 1 }).skip(skip).limit(limit).populate("order").populate("driver"),
    Delivery.countDocuments(filter),
  ]);
  return { items, total };
};

const getById = async (id) => {
  return await Delivery.findById(id).populate("order").populate("driver");
}

const create = async (data) => {
  return await Delivery.create(data);
}

const updateStatus = async (id, status) => {
  return await Delivery.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
}

const remove = async (id) => {
  return await Delivery.findByIdAndDelete(id);
}   

const insertMany = async (data) => {
  return await Delivery.insertMany(data);
}

const getByOrder = async (orderId) => {
  return await Delivery.findOne({ order: orderId });
};

export default { getAll, getById, create, updateStatus, remove, insertMany, getByOrder };