import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './helpers/db.js';
import { expectError, expectSuccess } from './helpers/assertions.js';
import { createUser, createDriver, createOrder, createDelivery, NON_EXISTENT_ID } from './helpers/factories.js';

describe('Deliveries API', () => {
  afterEach(clearDatabase);

  describe('GET /api/deliveries', () => {
    it('debería responder con la lista de entregas, con el pedido y el repartidor completos', async () => {
      await createDelivery();

      const response = await request(app).get('/api/deliveries');

      expectSuccess(response, 200);
      expect(response.body.payload).to.be.an('array').with.lengthOf(1);
      expect(response.body.payload[0].order).to.include.keys('_id', 'deliveryAddress');
      expect(response.body.payload[0].driver).to.include.keys('_id', 'email');
      expect(response.body.payload[0].driver.role).to.equal('driver');
    });
  });

  describe('GET /api/deliveries/:did', () => {
    it('debería devolver la entrega consultada', async () => {
      const delivery = await createDelivery();

      const response = await request(app).get(`/api/deliveries/${delivery._id}`);

      expectSuccess(response, 200);
      expect(response.body.payload._id).to.equal(delivery._id.toString());
    });

    it('debería responder 404 DELIVERY_NOT_FOUND si la entrega no existe', async () => {
      const response = await request(app).get(`/api/deliveries/${NON_EXISTENT_ID}`);

      expectError(response, 404, 'DELIVERY_NOT_FOUND');
    });

    it('debería responder 400 INVALID_ID_MONGOOSE si el ID no tiene formato válido', async () => {
      const response = await request(app).get('/api/deliveries/id-invalido');

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });
  });

  describe('POST /api/deliveries', () => {
    it('debería asignar un repartidor disponible a un pedido', async () => {
      const order = await createOrder();
      const driver = await createDriver();

      const response = await request(app)
        .post('/api/deliveries')
        .send({ order: order._id.toString(), driver: driver._id.toString(), priority: 'high', notes: 'Entregar en recepción' });

      expectSuccess(response, 201);
      expect(response.body.payload.order).to.equal(order._id.toString());
      expect(response.body.payload.driver).to.equal(driver._id.toString());
      expect(response.body.payload.status).to.equal('assigned');
      expect(response.body.payload.priority).to.equal('high');
      expect(response.body.payload.notes).to.equal('Entregar en recepción');
    });

    it('debería usar prioridad normal si no se envía', async () => {
      const order = await createOrder();
      const driver = await createDriver();

      const response = await request(app).post('/api/deliveries').send({ order: order._id.toString(), driver: driver._id.toString() });

      expectSuccess(response, 201);
      expect(response.body.payload.priority).to.equal('normal');
    });

    it('debería responder 400 VALIDATION_ERROR si faltan el pedido o el repartidor', async () => {
      const order = await createOrder();

      const response = await request(app).post('/api/deliveries').send({ order: order._id.toString() });

      expectError(response, 400, 'VALIDATION_ERROR');
    });

    it('debería responder 404 ORDER_NOT_FOUND si el pedido no existe', async () => {
      const driver = await createDriver();

      const response = await request(app).post('/api/deliveries').send({ order: NON_EXISTENT_ID, driver: driver._id.toString() });

      expectError(response, 404, 'ORDER_NOT_FOUND');
    });

    it('debería responder 404 USER_NOT_FOUND si el repartidor no existe', async () => {
      const order = await createOrder();

      const response = await request(app).post('/api/deliveries').send({ order: order._id.toString(), driver: NON_EXISTENT_ID });

      expectError(response, 404, 'USER_NOT_FOUND');
    });

    it('debería responder 400 INVALID_DRIVER si el usuario no es repartidor', async () => {
      const order = await createOrder();
      const customer = await createUser();

      const response = await request(app).post('/api/deliveries').send({ order: order._id.toString(), driver: customer._id.toString() });

      expectError(response, 400, 'INVALID_DRIVER');
    });

    it('debería responder 409 DRIVER_NOT_AVAILABLE si el repartidor no está disponible', async () => {
      const order = await createOrder();
      const driver = await createDriver({ isAvailable: false });

      const response = await request(app).post('/api/deliveries').send({ order: order._id.toString(), driver: driver._id.toString() });

      expectError(response, 409, 'DRIVER_NOT_AVAILABLE');
    });

    it('debería responder 409 DELIVERY_ALREADY_ASSIGNED si el pedido ya tiene entrega', async () => {
      const order = await createOrder();
      await createDelivery({ order: order._id });
      const anotherDriver = await createDriver();

      const response = await request(app).post('/api/deliveries').send({ order: order._id.toString(), driver: anotherDriver._id.toString() });

      expectError(response, 409, 'DELIVERY_ALREADY_ASSIGNED');
    });

    it('debería responder 400 INVALID_ID_MONGOOSE si el pedido tiene un ID con formato inválido', async () => {
      const driver = await createDriver();

      const response = await request(app).post('/api/deliveries').send({ order: 'abc', driver: driver._id.toString() });

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });

    it('debería responder 400 INVALID_DATA si la prioridad no existe', async () => {
      const order = await createOrder();
      const driver = await createDriver();

      const response = await request(app)
        .post('/api/deliveries')
        .send({ order: order._id.toString(), driver: driver._id.toString(), priority: 'urgentisima' });

      expectError(response, 400, 'INVALID_DATA');
    });
  });

  describe('PUT /api/deliveries/:did/status', () => {
    it('debería actualizar el estado de la entrega', async () => {
      const delivery = await createDelivery();

      const response = await request(app).put(`/api/deliveries/${delivery._id}/status`).send({ status: 'in_transit' });

      expectSuccess(response, 200);
      expect(response.body.payload.status).to.equal('in_transit');
    });

    it('debería responder 400 INVALID_DELIVERY_STATUS si el estado no existe', async () => {
      const delivery = await createDelivery();

      const response = await request(app).put(`/api/deliveries/${delivery._id}/status`).send({ status: 'volando' });

      expectError(response, 400, 'INVALID_DELIVERY_STATUS');
    });

    it('debería responder 400 INVALID_DELIVERY_STATUS con un estado que solo existe para pedidos', async () => {
      const delivery = await createDelivery();

      const response = await request(app).put(`/api/deliveries/${delivery._id}/status`).send({ status: 'picked_up' });

      expectError(response, 400, 'INVALID_DELIVERY_STATUS');
    });

    it('debería responder 404 DELIVERY_NOT_FOUND si la entrega no existe', async () => {
      const response = await request(app).put(`/api/deliveries/${NON_EXISTENT_ID}/status`).send({ status: 'delivered' });

      expectError(response, 404, 'DELIVERY_NOT_FOUND');
    });
  });

  describe('DELETE /api/deliveries/:did', () => {
    it('debería eliminar la entrega y ya no poder consultarla', async () => {
      const delivery = await createDelivery();

      const deleted = await request(app).delete(`/api/deliveries/${delivery._id}`);
      const afterDelete = await request(app).get(`/api/deliveries/${delivery._id}`);

      expectSuccess(deleted, 200);
      expect(deleted.body.payload._id).to.equal(delivery._id.toString());
      expectError(afterDelete, 404, 'DELIVERY_NOT_FOUND');
    });

    it('debería responder 404 DELIVERY_NOT_FOUND si la entrega no existe', async () => {
      const response = await request(app).delete(`/api/deliveries/${NON_EXISTENT_ID}`);

      expectError(response, 404, 'DELIVERY_NOT_FOUND');
    });
  });
});
