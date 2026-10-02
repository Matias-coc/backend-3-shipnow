import Delivery from "../models/delivery.model.js";

const getAll = async () => {
  return await Delivery.find().populate("order").populate("driver");
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

export default { getAll, getById, create, updateStatus, remove, insertMany };