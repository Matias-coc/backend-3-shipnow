import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import UserModel from '../src/models/user.model.js';
import StoreModel from '../src/models/store.model.js';
import OrderModel from '../src/models/order.model.js';
import DeliveryModel from '../src/models/delivery.model.js';
import { clearDatabase } from './helpers/db.js';
import { expectError, expectSuccess } from './helpers/assertions.js';

const INVALID_QUANTITIES = ['0', '-5', '2.5', 'abc', ''];

describe('Mocks API', () => {
  afterEach(clearDatabase);

  describe('GET /api/mocks/mockingusers', () => {
    it('debería generar 10 usuarios por defecto, sin guardarlos en la base', async () => {
      const response = await request(app).get('/api/mocks/mockingusers');

      expectSuccess(response, 200);
      expect(response.body.payload).to.be.an('array').with.lengthOf(10);
      expect(response.body.payload[0]).to.include.keys('_id', 'firstName', 'lastName', 'email', 'role');
      expect(response.body.payload[0].role).to.equal('customer');
      expect(await UserModel.countDocuments()).to.equal(0);
    });

    it('debería generar la cantidad pedida', async () => {
      const response = await request(app).get('/api/mocks/mockingusers?qty=3');

      expectSuccess(response, 200);
      expect(response.body.payload).to.have.lengthOf(3);
    });

    INVALID_QUANTITIES.forEach((qty) => {
      it(`debería responder 400 INVALID_MOCK_AMOUNT con qty="${qty}"`, async () => {
        const response = await request(app).get(`/api/mocks/mockingusers?qty=${qty}`);

        expectError(response, 400, 'INVALID_MOCK_AMOUNT');
      });
    });
  });

  describe('GET /api/mocks/mockingorders', () => {
    it('debería generar la cantidad pedida de pedidos relacionados, sin guardarlos', async () => {
      const response = await request(app).get('/api/mocks/mockingorders?qty=4');

      expectSuccess(response, 200);
      expect(response.body.payload).to.have.lengthOf(4);
      response.body.payload.forEach((order) => {
        expect(order).to.include.keys('_id', 'customer', 'store', 'items', 'deliveryAddress', 'total', 'status', 'priority');
        expect(order.status).to.equal('created');
      });
      expect(await OrderModel.countDocuments()).to.equal(0);
    });

    INVALID_QUANTITIES.forEach((qty) => {
      it(`debería responder 400 INVALID_MOCK_AMOUNT con qty="${qty}"`, async () => {
        const response = await request(app).get(`/api/mocks/mockingorders?qty=${qty}`);

        expectError(response, 400, 'INVALID_MOCK_AMOUNT');
      });
    });
  });

  describe('POST /api/mocks/generateData', () => {
    it('debería generar y guardar datos relacionados entre sí', async () => {
      const response = await request(app)
        .post('/api/mocks/generateData')
        .send({ users: 3, stores: 2, drivers: 2, orders: 4, deliveries: 2 });

      expectSuccess(response, 201);
      // "users" cuenta los clientes (3) y los usuarios dueños de comercios (2)
      expect(response.body.payload).to.deep.equal({ users: 5, stores: 2, drivers: 2, orders: 4, deliveries: 2 });

      expect(await UserModel.countDocuments()).to.equal(7);
      expect(await StoreModel.countDocuments()).to.equal(2);
      expect(await OrderModel.countDocuments()).to.equal(4);
      expect(await DeliveryModel.countDocuments()).to.equal(2);
    });

    it('debería guardar pedidos y entregas con referencias reales y coherentes', async () => {
      await request(app).post('/api/mocks/generateData').send({ users: 2, stores: 2, drivers: 2, orders: 3, deliveries: 2 });

      const orders = await OrderModel.find().populate('customer').populate('store');
      orders.forEach((order) => {
        expect(order.customer, 'cliente del pedido').to.not.equal(null);
        expect(order.customer.role).to.equal('customer');
        expect(order.store, 'comercio del pedido').to.not.equal(null);
      });

      const deliveries = await DeliveryModel.find().populate('order').populate('driver');
      deliveries.forEach((delivery) => {
        expect(delivery.order, 'pedido de la entrega').to.not.equal(null);
        expect(delivery.driver, 'repartidor de la entrega').to.not.equal(null);
        expect(delivery.driver.role).to.equal('driver');
      });
    });

    it('debería poder ejecutarse varias veces seguidas sin chocar con los emails', async () => {
      const body = { users: 2, stores: 1, drivers: 1, orders: 1, deliveries: 1 };

      const first = await request(app).post('/api/mocks/generateData').send(body);
      const second = await request(app).post('/api/mocks/generateData').send(body);

      expectSuccess(first, 201);
      expectSuccess(second, 201);
      expect(await UserModel.countDocuments()).to.equal(8);
    });

    it('debería usar los valores por defecto si el body está vacío', async () => {
      const response = await request(app).post('/api/mocks/generateData').send({});

      expectSuccess(response, 201);
      expect(response.body.payload).to.deep.equal({ users: 15, stores: 5, drivers: 3, orders: 10, deliveries: 5 });
    });

    [{ users: 0 }, { users: -1 }, { orders: 2.5 }, { drivers: 'abc' }, { deliveries: true }].forEach((body) => {
      it(`debería responder 400 INVALID_MOCK_AMOUNT con ${JSON.stringify(body)}`, async () => {
        const response = await request(app).post('/api/mocks/generateData').send(body);

        expectError(response, 400, 'INVALID_MOCK_AMOUNT');
        expect(await UserModel.countDocuments(), 'no debe guardar nada').to.equal(0);
      });
    });

    it('debería responder 400 VALIDATION_ERROR si el body no es un objeto', async () => {
      const response = await request(app).post('/api/mocks/generateData').send([1, 2]);

      expectError(response, 400, 'VALIDATION_ERROR');
    });
  });
});
