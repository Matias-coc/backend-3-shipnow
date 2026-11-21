import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './helpers/db.js';
import { expectError, expectSuccess } from './helpers/assertions.js';
import { createUser, createDriver, createOrder, createDelivery } from './helpers/factories.js';

describe('Paginación y filtros de los listados', () => {
  afterEach(clearDatabase);

  describe('GET /api/users', () => {
    it('debería paginar por omisión: página 1 con 10 resultados', async () => {
      await Promise.all(Array.from({ length: 12 }, () => createUser()));

      const response = await request(app).get('/api/users');

      expectSuccess(response, 200);
      expect(response.body.payload).to.have.lengthOf(10);
      expect(response.body.pagination).to.deep.equal({
        page: 1, limit: 10, total: 12, totalPages: 2, hasNextPage: true, hasPrevPage: false,
      });
    });

    it('debería respetar page y limit', async () => {
      await Promise.all(Array.from({ length: 12 }, () => createUser()));

      const page2 = await request(app).get('/api/users?page=2&limit=5');
      const page3 = await request(app).get('/api/users?page=3&limit=5');

      expectSuccess(page2, 200);
      expect(page2.body.payload).to.have.lengthOf(5);
      expect(page2.body.pagination).to.include({ page: 2, limit: 5, total: 12, totalPages: 3, hasNextPage: true, hasPrevPage: true });
      expect(page3.body.payload).to.have.lengthOf(2);
      expect(page3.body.pagination).to.include({ hasNextPage: false, hasPrevPage: true });
    });

    it('no debería repetir usuarios entre páginas', async () => {
      await Promise.all(Array.from({ length: 6 }, () => createUser()));

      const first = await request(app).get('/api/users?page=1&limit=3');
      const second = await request(app).get('/api/users?page=2&limit=3');
      const ids = [...first.body.payload, ...second.body.payload].map((user) => user._id);

      expect(new Set(ids).size).to.equal(6);
    });

    it('debería devolver una lista vacía si la página supera el total', async () => {
      await createUser();

      const response = await request(app).get('/api/users?page=5');

      expectSuccess(response, 200);
      expect(response.body.payload).to.deep.equal([]);
      expect(response.body.pagination.total).to.equal(1);
    });

    for (const query of ['page=0', 'page=-1', 'page=1.5', 'page=abc', 'limit=0', 'limit=abc', 'limit=101', 'page=1&page=2']) {
      it(`debería responder 400 INVALID_PAGINATION con ?${query}`, async () => {
        const response = await request(app).get(`/api/users?${query}`);

        expectError(response, 400, 'INVALID_PAGINATION');
      });
    }

    it('debería filtrar por rol', async () => {
      await createDriver();
      await createDriver();
      await createUser();

      const response = await request(app).get('/api/users?role=driver');

      expectSuccess(response, 200);
      expect(response.body.pagination.total).to.equal(2);
      expect(response.body.payload.every((user) => user.role === 'driver')).to.equal(true);
    });

    it('debería responder 400 INVALID_DATA si el rol no existe', async () => {
      const response = await request(app).get('/api/users?role=superadmin');

      expectError(response, 400, 'INVALID_DATA');
    });
  });

  describe('GET /api/orders', () => {
    it('debería paginar y mantener el cliente y el comercio completos', async () => {
      await createOrder();
      await createOrder();
      await createOrder();

      const response = await request(app).get('/api/orders?limit=2');

      expectSuccess(response, 200);
      expect(response.body.payload).to.have.lengthOf(2);
      expect(response.body.pagination).to.include({ page: 1, limit: 2, total: 3, totalPages: 2, hasNextPage: true });
      expect(response.body.payload[0].customer).to.include.keys('_id', 'email');
    });

    it('debería filtrar por estado', async () => {
      await createOrder({ status: 'in_transit' });
      await createOrder();

      const response = await request(app).get('/api/orders?status=in_transit');

      expectSuccess(response, 200);
      expect(response.body.pagination.total).to.equal(1);
      expect(response.body.payload[0].status).to.equal('in_transit');
    });

    it('debería filtrar por prioridad', async () => {
      await createOrder({ priority: 'high' });
      await createOrder();

      const response = await request(app).get('/api/orders?priority=high');

      expectSuccess(response, 200);
      expect(response.body.pagination.total).to.equal(1);
    });

    it('debería filtrar por cliente', async () => {
      const customer = await createUser();
      await createOrder({ customer: customer._id });
      await createOrder();

      const response = await request(app).get(`/api/orders?customer=${customer._id}`);

      expectSuccess(response, 200);
      expect(response.body.pagination.total).to.equal(1);
      expect(response.body.payload[0].customer._id).to.equal(customer._id.toString());
    });

    it('debería responder 400 INVALID_ORDER_STATUS si el estado no existe', async () => {
      const response = await request(app).get('/api/orders?status=volando');

      expectError(response, 400, 'INVALID_ORDER_STATUS');
    });

    it('debería responder 400 INVALID_DATA si la prioridad no existe', async () => {
      const response = await request(app).get('/api/orders?priority=urgentisima');

      expectError(response, 400, 'INVALID_DATA');
    });

    it('debería responder 400 INVALID_ID_MONGOOSE si el ID del cliente no es válido', async () => {
      const response = await request(app).get('/api/orders?customer=abc');

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });

    it('debería rechazar filtros con operadores de Mongo (?customer[$ne]=x)', async () => {
      const response = await request(app).get('/api/orders?customer[$ne]=x');

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });

    it('debería responder 400 INVALID_PAGINATION con un limit mayor al máximo', async () => {
      const response = await request(app).get('/api/orders?limit=101');

      expectError(response, 400, 'INVALID_PAGINATION');
    });
  });

  describe('GET /api/deliveries', () => {
    it('debería paginar y mantener el pedido y el repartidor completos', async () => {
      await createDelivery();
      await createDelivery();
      await createDelivery();

      const page2 = await request(app).get('/api/deliveries?page=2&limit=2');

      expectSuccess(page2, 200);
      expect(page2.body.payload).to.have.lengthOf(1);
      expect(page2.body.pagination).to.include({ page: 2, limit: 2, total: 3, totalPages: 2, hasNextPage: false, hasPrevPage: true });
      expect(page2.body.payload[0].driver).to.include.keys('_id', 'email');
    });

    it('debería filtrar por estado', async () => {
      await createDelivery({ status: 'delivered' });
      await createDelivery();

      const response = await request(app).get('/api/deliveries?status=delivered');

      expectSuccess(response, 200);
      expect(response.body.pagination.total).to.equal(1);
      expect(response.body.payload[0].status).to.equal('delivered');
    });

    it('debería filtrar por repartidor', async () => {
      const driver = await createDriver();
      await createDelivery({ driver: driver._id });
      await createDelivery();

      const response = await request(app).get(`/api/deliveries?driver=${driver._id}`);

      expectSuccess(response, 200);
      expect(response.body.pagination.total).to.equal(1);
    });

    it('debería responder 400 INVALID_DELIVERY_STATUS si el estado no existe', async () => {
      const response = await request(app).get('/api/deliveries?status=perdida');

      expectError(response, 400, 'INVALID_DELIVERY_STATUS');
    });

    it('debería responder 400 INVALID_ID_MONGOOSE si el ID del repartidor no es válido', async () => {
      const response = await request(app).get('/api/deliveries?driver=abc');

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });
  });
});
