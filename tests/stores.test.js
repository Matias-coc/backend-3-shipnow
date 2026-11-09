import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './helpers/db.js';
import { expectError, expectSuccess } from './helpers/assertions.js';
import { createUser, createStore, NON_EXISTENT_ID } from './helpers/factories.js';

describe('Stores API', () => {
  afterEach(clearDatabase);

  it('GET /api/stores debería listar los comercios', async () => {
    await createStore();

    const response = await request(app).get('/api/stores');

    expectSuccess(response, 200);
    expect(response.body.payload).to.have.lengthOf(1);
    expect(response.body.payload[0]).to.include.keys('_id', 'name', 'address', 'owner', 'isActive');
  });

  it('POST /api/stores debería crear un comercio activo', async () => {
    const owner = await createUser({ role: 'store' });

    const response = await request(app)
      .post('/api/stores')
      .send({ name: 'Kiosco Centro', address: 'Av. Siempre Viva 742', owner: owner._id.toString() });

    expectSuccess(response, 201);
    expect(response.body.payload.name).to.equal('Kiosco Centro');
    expect(response.body.payload.isActive).to.equal(true);
  });

  it('POST /api/stores debería responder 400 VALIDATION_ERROR si faltan datos obligatorios', async () => {
    const response = await request(app).post('/api/stores').send({ name: 'Kiosco Centro' });

    expectError(response, 400, 'VALIDATION_ERROR');
  });

  it('PUT /api/stores/:sid debería actualizar solo los campos enviados', async () => {
    const store = await createStore({ name: 'Original', address: 'Calle 1' });

    const response = await request(app).put(`/api/stores/${store._id}`).send({ name: 'Nuevo nombre' });

    expectSuccess(response, 200);
    expect(response.body.payload.name).to.equal('Nuevo nombre');
    expect(response.body.payload.address).to.equal('Calle 1');
  });

  it('DELETE /api/stores/:sid debería eliminar el comercio', async () => {
    const store = await createStore();

    const deleted = await request(app).delete(`/api/stores/${store._id}`);
    const afterDelete = await request(app).get(`/api/stores/${store._id}`);

    expectSuccess(deleted, 200);
    expectError(afterDelete, 404, 'STORE_NOT_FOUND');
  });

  it('PUT /api/stores/:sid debería responder 404 STORE_NOT_FOUND si no existe', async () => {
    const response = await request(app).put(`/api/stores/${NON_EXISTENT_ID}`).send({ name: 'X' });

    expectError(response, 404, 'STORE_NOT_FOUND');
  });
});
