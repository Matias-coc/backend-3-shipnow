import usersMock from '../mocks/users.mock.js';
import storesMock from '../mocks/stores.mock.js';
import ordersMock from '../mocks/orders.mock.js';
import deliveriesMock from '../mocks/deliveries.mock.js';
import userRepository from '../repositories/user.repository.js';
import storeRepository from '../repositories/store.repository.js';
import orderRepository from '../repositories/order.repository.js';
import deliveryRepository from '../repositories/delivery.repository.js';
import { createError } from '../errors/apiResponse.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

const parseQuantity = (qty, fallback) => {
  if (qty === undefined) return fallback;

  const parsed = Number(qty);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw createError(ERROR_CODES.INVALID_MOCK_AMOUNT);
  }

  return parsed;
};

const generateUsers = (quantity) => {
    const qty = parseQuantity(quantity, 10);
    return usersMock.generateMockUsers(qty);
};

const generateOrders = (quantity) => {
    const qty = parseQuantity(quantity, 10);
    const customers = usersMock.generateMockUsers(qty);
    const storeUsers = usersMock.generateMockStoreUsers(qty);
    const stores = storesMock.generateMockStores(storeUsers, qty);

    return ordersMock.generateMockOrders(
    customers.map((c) => c._id),
    stores.map((s) => s._id),
    qty,
    );
};

const generateData = async ({ users, stores, drivers, orders, deliveries }) => {

    const usersQty = parseQuantity(users, 10);
    const storesQty = parseQuantity(stores, 5);
    const driversQty = parseQuantity(drivers, 3);
    const ordersQty = parseQuantity(orders, 10);
    const deliveriesQty = parseQuantity(deliveries, 5);

    const result = { users: 0, stores: 0, drivers: 0, orders: 0, deliveries: 0 };

    let createdCustomers = [];
    if (usersQty > 0) {
        createdCustomers = await userRepository.insertMany(generateUsers(usersQty));
        result.users = createdCustomers.length;
    }

    let createdStoreUsers = [];
    if (storesQty > 0) {
        createdStoreUsers = await userRepository.insertMany(usersMock.generateMockStoreUsers(storesQty));
        result.users += createdStoreUsers.length;
    }

    let createdStores = [];
    if (storesQty > 0 && createdStoreUsers.length > 0) {
        createdStores = await storeRepository.insertMany(storesMock.generateMockStores(createdStoreUsers, storesQty));
        result.stores = createdStores.length;
    }

    let createdDrivers = [];
    if (driversQty > 0) {
        createdDrivers = await userRepository.insertMany(usersMock.generateMockDrivers(driversQty));
        result.drivers = createdDrivers.length;
    }

    let createdOrders = [];
    if (ordersQty > 0 && createdCustomers.length > 0 && createdStores.length > 0) {
        createdOrders = await orderRepository.insertMany(
            ordersMock.generateMockOrders(
                createdCustomers.map((c) => c._id),
                createdStores.map((s) => s._id),
                ordersQty,
            ),
        );
        result.orders = createdOrders.length;
    }

    let createdDeliveries = [];
    if (deliveriesQty > 0 && createdOrders.length > 0 && createdDrivers.length > 0) {
        createdDeliveries = await deliveryRepository.insertMany(deliveriesMock.generateMockDeliveries(createdOrders, createdDrivers, deliveriesQty));
        result.deliveries = createdDeliveries.length;
    }

    return result;
};

export default { generateUsers, generateOrders, generateData };