import { DRIVER_STATUS, PRIORITY_LEVELS } from '../constants/index.js';

const generateMockDelivery = (orderId, driverId, index) => {
  return {
    order: orderId,
    driver: driverId,
    status: DRIVER_STATUS.ASSIGNED,
    priority: PRIORITY_LEVELS.NORMAL,
    notes: `Entrega de prueba ${index + 1}`,
  };
};

const generateMockDeliveries = (orders, drivers, quantity) => {
    return Array.from({ length: quantity }, (_, i) => {
        const order = orders[i % orders.length];
        const driver = drivers[i % drivers.length];
        return generateMockDelivery(order._id, driver._id, i);
    });
};

export default { generateMockDelivery, generateMockDeliveries };