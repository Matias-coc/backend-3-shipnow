import UserModel from '../../src/models/user.model.js';
import StoreModel from '../../src/models/store.model.js';
import OrderModel from '../../src/models/order.model.js';
import ProductModel from '../../src/models/product.model.js';
import DeliveryModel from '../../src/models/delivery.model.js';
import { USER_ROLES } from '../../src/constants/index.js';

let counter = 0;
const unique = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

// ID con formato válido de MongoDB que no corresponde a ningún documento
export const NON_EXISTENT_ID = '000000000000000000000000';

export const createUser = (overrides = {}) =>
  UserModel.create({
    firstName: 'Test',
    lastName: 'User',
    email: `test-${unique()}@mail.com`,
    password: 'coder123',
    role: USER_ROLES.CUSTOMER,
    ...overrides,
  });

export const createDriver = (overrides = {}) =>
  createUser({ role: USER_ROLES.DRIVER, isAvailable: true, ...overrides });

export const createStore = async (overrides = {}) => {
  const owner = await createUser({ role: USER_ROLES.STORE });
  return StoreModel.create({ name: 'Comercio de prueba', address: 'Calle Falsa 123', owner: owner._id, ...overrides });
};

export const createOrder = async (overrides = {}) => {
  const customer = overrides.customer ?? (await createUser())._id;
  const store = overrides.store ?? (await createStore())._id;
  return OrderModel.create({
    items: [{ name: 'Paquete mediano', quantity: 2, price: 1500 }],
    deliveryAddress: 'Av. Siempre Viva 742',
    total: 3000,
    ...overrides,
    customer,
    store,
  });
};

export const createProduct = async (overrides = {}) => {
  const store = overrides.store ?? (await createStore())._id;
  return ProductModel.create({ name: 'Producto de prueba', price: 1000, stock: 5, status: 'available', ...overrides, store });
};

export const createDelivery = async (overrides = {}) => {
  const order = overrides.order ?? (await createOrder())._id;
  const driver = overrides.driver ?? (await createDriver())._id;
  return DeliveryModel.create({ ...overrides, order, driver });
};
