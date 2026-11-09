import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './helpers/db.js';
import { expectError, expectSuccess } from './helpers/assertions.js';
import { createUser, NON_EXISTENT_ID } from './helpers/factories.js';

const validUserBody = (overrides = {}) => ({
  firstName: 'Ana',
  lastName: 'Paz',
  email: `ana-${Date.now()}@mail.com`,
  password: 'coder123',
  ...overrides,
});

describe('Users API', () => {
  afterEach(clearDatabase);

  describe('GET /api/users', () => {
    it('debería responder con la lista de usuarios', async () => {
      await createUser();
      await createUser();

      const response = await request(app).get('/api/users');

      expectSuccess(response, 200);
      expect(response.body.message).to.equal('Lista de usuarios');
      expect(response.body.payload).to.be.an('array').with.lengthOf(2);
      expect(response.body.payload[0]).to.include.keys('_id', 'firstName', 'lastName', 'email', 'role');
    });

    it('debería responder con una lista vacía si no hay usuarios', async () => {
      const response = await request(app).get('/api/users');

      expectSuccess(response, 200);
      expect(response.body.payload).to.deep.equal([]);
    });
  });

  describe('GET /api/users/:uid', () => {
    it('debería devolver el usuario consultado', async () => {
      const user = await createUser({ firstName: 'Martina' });

      const response = await request(app).get(`/api/users/${user._id}`);

      expectSuccess(response, 200);
      expect(response.body.payload._id).to.equal(user._id.toString());
      expect(response.body.payload.firstName).to.equal('Martina');
    });

    it('debería responder 404 USER_NOT_FOUND si el usuario no existe', async () => {
      const response = await request(app).get(`/api/users/${NON_EXISTENT_ID}`);

      expectError(response, 404, 'USER_NOT_FOUND');
    });

    it('debería responder 400 INVALID_ID_MONGOOSE si el ID no tiene formato válido', async () => {
      const response = await request(app).get('/api/users/id-invalido');

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });
  });

  describe('POST /api/users', () => {
    it('debería crear un usuario con los valores por defecto', async () => {
      const response = await request(app).post('/api/users').send(validUserBody());

      expectSuccess(response, 201);
      expect(response.body.message).to.equal('Usuario creado');
      expect(response.body.payload).to.include.keys('_id', 'createdAt', 'updatedAt');
      expect(response.body.payload.role).to.equal('customer');
      expect(response.body.payload.isAvailable).to.equal(false);
    });

    it('debería responder 400 VALIDATION_ERROR si faltan datos obligatorios', async () => {
      const response = await request(app).post('/api/users').send({ firstName: 'Ana' });

      expectError(response, 400, 'VALIDATION_ERROR');
    });

    it('debería responder 400 INVALID_DATA si el role no existe', async () => {
      const response = await request(app).post('/api/users').send(validUserBody({ role: 'superadmin' }));

      expectError(response, 400, 'INVALID_DATA');
    });

    it('debería responder 409 DUPLICATE_KEY_ERROR si el email ya está registrado', async () => {
      const body = validUserBody();
      await request(app).post('/api/users').send(body);

      const response = await request(app).post('/api/users').send(body);

      expectError(response, 409, 'DUPLICATE_KEY_ERROR');
    });
  });

  describe('PUT /api/users/:uid', () => {
    it('debería actualizar solo los campos enviados', async () => {
      const user = await createUser({ firstName: 'Ana', lastName: 'Paz' });

      const response = await request(app).put(`/api/users/${user._id}`).send({ firstName: 'Anita' });

      expectSuccess(response, 200);
      expect(response.body.payload.firstName).to.equal('Anita');
      expect(response.body.payload.lastName).to.equal('Paz');
    });

    it('debería responder 404 USER_NOT_FOUND si el usuario no existe', async () => {
      const response = await request(app).put(`/api/users/${NON_EXISTENT_ID}`).send({ firstName: 'X' });

      expectError(response, 404, 'USER_NOT_FOUND');
    });
  });

  describe('DELETE /api/users/:uid', () => {
    it('debería eliminar el usuario y ya no poder consultarlo', async () => {
      const user = await createUser();

      const deleted = await request(app).delete(`/api/users/${user._id}`);
      const afterDelete = await request(app).get(`/api/users/${user._id}`);

      expectSuccess(deleted, 200);
      expect(deleted.body.payload._id).to.equal(user._id.toString());
      expectError(afterDelete, 404, 'USER_NOT_FOUND');
    });

    it('debería responder 404 USER_NOT_FOUND si el usuario no existe', async () => {
      const response = await request(app).delete(`/api/users/${NON_EXISTENT_ID}`);

      expectError(response, 404, 'USER_NOT_FOUND');
    });
  });
});
