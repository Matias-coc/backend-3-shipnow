import mongoose from "mongoose";
import { ORDER_STATUS, PRIORITY_LEVELS } from "../constants/index.js";

const generateMockOrder = (customerId, storeId, index) => {
    const items = [
        {
        name: `Producto ${index + 1}`,
        quantity: 1,
        price: 1500,
        },
    ];

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return {
    _id: new mongoose.Types.ObjectId(),
    customer: customerId,
    store: storeId,
    items,
    deliveryAddress: `Dirección ${index + 1}`,
    total,
    status: ORDER_STATUS.CREATED,
    priority: PRIORITY_LEVELS.NORMAL,
  };
};

const generateMockOrders = (customerIds, storeIds, quantity) => {
  return Array.from({ length: quantity }, (_, i) => {
    const customerId = customerIds[i % customerIds.length];
    const storeId = storeIds[i % storeIds.length];
    return generateMockOrder(customerId, storeId, i);
  });
};

export default { generateMockOrder, generateMockOrders };
