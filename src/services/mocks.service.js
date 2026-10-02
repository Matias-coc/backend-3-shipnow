import usersMock from '../mocks/users.mock.js';
import storesMock from '../mocks/stores.mock.js';
import ordersMock from '../mocks/orders.mock.js';
import deliveriesMock from '../mocks/deliveries.mock.js';
import userRepository from '../repositories/user.repository.js';
import storeRepository from '../repositories/store.repository.js';
import orderRepository from '../repositories/order.repository.js';
import deliveryRepository from '../repositories/delivery.repository.js';

const generateUsers = (quantity) => {
    return usersMock.generateMockUsers(quantity);
};

const generateOrders = (quantity) => {
    const customers = usersMock.generateMockUsers(quantity);
    const storeUsers = usersMock.generateMockStoreUsers(quantity);
    const stores = storesMock.generateMockStores(storeUsers, quantity);

    return ordersMock.generateMockOrders(
    customers.map((c) => c._id),
    stores.map((s) => s._id),
    quantity,
    );
};

const generateData = async ({ users = 10, stores = 5, drivers = 3, orders = 10, deliveries = 5 }) => {
    const result = { users: 0, stores: 0, drivers: 0, orders: 0, deliveries: 0 };


    let createdCustomers = [];
    if (users > 0) {
        createdCustomers = await userRepository.insertMany(generateUsers(users));
        result.users = createdCustomers.length;
    }

    let createdStoreUsers = [];
    if (stores > 0) {
        createdStoreUsers = await userRepository.insertMany(usersMock.generateMockStoreUsers(stores));
        result.users += createdStoreUsers.length;
    }

    let createdStores = [];
    if (stores > 0 && createdStoreUsers.length > 0) {
        createdStores = await storeRepository.insertMany(storesMock.generateMockStores(createdStoreUsers, stores));
        result.stores = createdStores.length;
    }

    let createdDrivers = [];
    if (drivers > 0) {
        createdDrivers = await userRepository.insertMany(usersMock.generateMockDrivers(drivers));
        result.drivers = createdDrivers.length;
    }

    let createdOrders = [];
    if (orders > 0 && createdCustomers.length > 0 && createdStores.length > 0) {
        createdOrders = await orderRepository.insertMany(
            ordersMock.generateMockOrders(
                createdCustomers.map((c) => c._id),
                createdStores.map((s) => s._id),
                orders,
            ),
        );
        result.orders = createdOrders.length;
    }

    let createdDeliveries = [];
    if (deliveries > 0 && createdOrders.length > 0 && createdDrivers.length > 0) {
        createdDeliveries = await deliveryRepository.insertMany(deliveriesMock.generateMockDeliveries(createdOrders, createdDrivers, deliveries));
        result.deliveries = createdDeliveries.length;
    }

    return result;
};

export default { generateUsers, generateOrders, generateData };