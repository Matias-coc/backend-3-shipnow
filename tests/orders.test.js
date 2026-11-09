import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './helpers/db.js';
import { expectError, expectSuccess } from './helpers/assertions.js';
import { createUser, createStore, createOrder, NON_EXISTENT_ID } from './helpers/factories.js';

describe('Orders API', () => {
  afterEach(clearDatabase);

  describe('GET /api/orders', () => {
    it('debería responder con la lista de pedidos, con el cliente y el comercio completos', async () => {
      await createOrder();

      const response = await request(app).get('/api/orders');

      expectSuccess(response, 200);
      expect(response.body.payload).to.be.an('array').with.lengthOf(1);
      expect(response.body.payload[0].customer).to.include.keys('_id', 'email');
      expect(response.body.payload[0].store).to.include.keys('_id', 'name');
    });
  });

  describe('GET /api/orders/:oid', () => {
    it('debería devolver el pedido consultado', async () => {
      const order = await createOrder();

      const response = await request(app).get(`/api/orders/${order._id}`);

      expectSuccess(response, 200);
      expect(response.body.payload._id).to.equal(order._id.toString());
      expect(response.body.payload.total).to.equal(3000);
      expect(response.body.payload.items).to.be.an('array').with.lengthOf(1);
    });

    it('debería responder 404 ORDER_NOT_FOUND si el pedido no existe', async () => {
      const response = await request(app).get(`/api/orders/${NON_EXISTENT_ID}`);

      expectError(response, 404, 'ORDER_NOT_FOUND');
    });

    it('debería responder 400 INVALID_ID_MONGOOSE si el ID no tiene formato válido', async () => {
      const response = await request(app).get('/api/orders/id-invalido');

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });
  });

  describe('POST /api/orders', () => {
    const buildBody = async (overrides = {}) => {
      const customer = await createUser();
      const store = await createStore();
      return {
        customer: customer._id.toString(),
        store: store._id.toString(),
        deliveryAddress: 'Av. Siempre Viva 742',
        items: [
          { name: 'Caja mediana', quantity: 2, price: 1500 },
          { name: 'Sobre chico', quantity: 1, price: 800 },
        ],
        ...overrides,
      };
    };

    it('debería crear un pedido con total calculado y estado inicial', async () => {
      const body = await buildBody();

      const response = await request(app).post('/api/orders').send(body);

      expectSuccess(response, 201);
      expect(response.body.message).to.equal('Pedido creado');
      expect(response.body.payload).to.include.keys('_id', 'customer', 'store', 'items', 'total', 'status', 'priority');
      expect(response.body.payload.customer).to.equal(body.customer);
      expect(response.body.payload.total).to.equal(3800);
      expect(response.body.payload.status).to.equal('created');
      expect(response.body.payload.priority).to.equal('normal');
    });

    it('debería responder 400 VALIDATION_ERROR si faltan los items', async () => {
      const body = await buildBody();
      delete body.items;

      const response = await request(app).post('/api/orders').send(body);

      expectError(response, 400, 'VALIDATION_ERROR');
    });

    it('debería responder 400 VALIDATION_ERROR si la lista de items está vacía', async () => {
      const response = await request(app).post('/api/orders').send(await buildBody({ items: [] }));

      expectError(response, 400, 'VALIDATION_ERROR');
    });

    it('debería responder 400 VALIDATION_ERROR si falta la dirección de entrega', async () => {
      const body = await buildBody();
      delete body.deliveryAddress;

      const response = await request(app).post('/api/orders').send(body);

      expectError(response, 400, 'VALIDATION_ERROR');
    });

    it('debería responder 404 USER_NOT_FOUND si el cliente no existe', async () => {
      const response = await request(app).post('/api/orders').send(await buildBody({ customer: NON_EXISTENT_ID }));

      expectError(response, 404, 'USER_NOT_FOUND');
    });

    it('debería responder 404 STORE_NOT_FOUND si el comercio no existe', async () => {
      const response = await request(app).post('/api/orders').send(await buildBody({ store: NON_EXISTENT_ID }));

      expectError(response, 404, 'STORE_NOT_FOUND');
    });

    it('debería responder 400 INVALID_ID_MONGOOSE si el cliente tiene un ID con formato inválido', async () => {
      const response = await request(app).post('/api/orders').send(await buildBody({ customer: 'abc' }));

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });

    it('debería responder 400 INVALID_DATA si la prioridad no existe', async () => {
      const response = await request(app).post('/api/orders').send(await buildBody({ priority: 'urgentisima' }));

      expectError(response, 400, 'INVALID_DATA');
    });
  });

  describe('PUT /api/orders/:oid/status', () => {
    it('debería actualizar el estado del pedido', async () => {
      const order = await createOrder();

      const response = await request(app).put(`/api/orders/${order._id}/status`).send({ status: 'in_transit' });

      expectSuccess(response, 200);
      expect(response.body.payload.status).to.equal('in_transit');
    });

    it('debería responder 400 INVALID_ORDER_STATUS si el estado no existe', async () => {
      const order = await createOrder();

      const response = await request(app).put(`/api/orders/${order._id}/status`).send({ status: 'volando' });

      expectError(response, 400, 'INVALID_ORDER_STATUS');
    });

    it('debería responder 400 INVALID_ORDER_STATUS si no se envía el estado', async () => {
      const order = await createOrder();

      const response = await request(app).put(`/api/orders/${order._id}/status`).send({});

      expectError(response, 400, 'INVALID_ORDER_STATUS');
    });

    it('debería responder 404 ORDER_NOT_FOUND si el pedido no existe', async () => {
      const response = await request(app).put(`/api/orders/${NON_EXISTENT_ID}/status`).send({ status: 'delivered' });

      expectError(response, 404, 'ORDER_NOT_FOUND');
    });
  });

  describe('DELETE /api/orders/:oid', () => {
    it('debería eliminar el pedido y ya no poder consultarlo', async () => {
      const order = await createOrder();

      const deleted = await request(app).delete(`/api/orders/${order._id}`);
      const afterDelete = await request(app).get(`/api/orders/${order._id}`);

      expectSuccess(deleted, 200);
      expectError(afterDelete, 404, 'ORDER_NOT_FOUND');
    });

    it('debería responder 404 ORDER_NOT_FOUND si el pedido no existe', async () => {
      const response = await request(app).delete(`/api/orders/${NON_EXISTENT_ID}`);

      expectError(response, 404, 'ORDER_NOT_FOUND');
    });
  });
});
