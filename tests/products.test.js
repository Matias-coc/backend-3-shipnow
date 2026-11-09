import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './helpers/db.js';
import { expectError, expectSuccess } from './helpers/assertions.js';
import { createStore, createProduct, NON_EXISTENT_ID } from './helpers/factories.js';

describe('Products API', () => {
  afterEach(clearDatabase);

  describe('POST /api/products', () => {
    it('debería marcar el producto como available si tiene stock', async () => {
      const store = await createStore();

      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Caja', price: 1500, stock: 10, store: store._id.toString() });

      expectSuccess(response, 201);
      expect(response.body.payload.status).to.equal('available');
    });

    it('debería marcar el producto como out_of_stock si el stock es 0', async () => {
      const store = await createStore();

      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Caja', price: 1500, stock: 0, store: store._id.toString() });

      expectSuccess(response, 201);
      expect(response.body.payload.status).to.equal('out_of_stock');
    });

    it('debería ignorar el status que envíe el cliente y calcularlo según el stock', async () => {
      const store = await createStore();

      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Caja', price: 1500, stock: 0, status: 'available', store: store._id.toString() });

      expect(response.body.payload.status).to.equal('out_of_stock');
    });

    it('debería responder 400 VALIDATION_ERROR si faltan datos obligatorios', async () => {
      const response = await request(app).post('/api/products').send({ name: 'Caja' });

      expectError(response, 400, 'VALIDATION_ERROR');
    });
  });

  describe('PUT /api/products/:pid', () => {
    it('debería recalcular el status cuando cambia el stock', async () => {
      const product = await createProduct({ stock: 5, status: 'available' });

      const response = await request(app).put(`/api/products/${product._id}`).send({ stock: 0 });

      expectSuccess(response, 200);
      expect(response.body.payload.stock).to.equal(0);
      expect(response.body.payload.status).to.equal('out_of_stock');
    });

    it('debería responder 404 PRODUCT_NOT_FOUND si el producto no existe', async () => {
      const response = await request(app).put(`/api/products/${NON_EXISTENT_ID}`).send({ stock: 3 });

      expectError(response, 404, 'PRODUCT_NOT_FOUND');
    });
  });

  describe('GET y DELETE', () => {
    it('debería listar, consultar y eliminar un producto', async () => {
      const product = await createProduct();

      const list = await request(app).get('/api/products');
      const one = await request(app).get(`/api/products/${product._id}`);
      const deleted = await request(app).delete(`/api/products/${product._id}`);
      const afterDelete = await request(app).get(`/api/products/${product._id}`);

      expectSuccess(list, 200);
      expect(list.body.payload).to.have.lengthOf(1);
      expectSuccess(one, 200);
      expectSuccess(deleted, 200);
      expectError(afterDelete, 404, 'PRODUCT_NOT_FOUND');
    });
  });
});
