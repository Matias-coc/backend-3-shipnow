import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import userService from '../src/services/user.service.js';
import { expectError } from './helpers/assertions.js';
import { NON_EXISTENT_ID } from './helpers/factories.js';

const RESOURCES = [
  { path: '/api/users', notFoundCode: 'USER_NOT_FOUND' },
  { path: '/api/stores', notFoundCode: 'STORE_NOT_FOUND' },
  { path: '/api/orders', notFoundCode: 'ORDER_NOT_FOUND' },
  { path: '/api/products', notFoundCode: 'PRODUCT_NOT_FOUND' },
  { path: '/api/deliveries', notFoundCode: 'DELIVERY_NOT_FOUND' },
];

describe('Manejo de errores', () => {
  it('debería responder 404 ROUTE_NOT_FOUND ante una ruta que no existe', async () => {
    const response = await request(app).get('/api/ruta-que-no-existe');

    expectError(response, 404, 'ROUTE_NOT_FOUND');
  });

  it('debería responder 404 ROUTE_NOT_FOUND ante un método que no existe en la ruta', async () => {
    const response = await request(app).patch('/api/users');

    expectError(response, 404, 'ROUTE_NOT_FOUND');
  });

  it('debería responder 400 INVALID_JSON_BODY si el body es un JSON mal formado', async () => {
    const response = await request(app).post('/api/users').set('Content-Type', 'application/json').send('{"firstName": ');

    expectError(response, 400, 'INVALID_JSON_BODY');
  });

  RESOURCES.forEach(({ path, notFoundCode }) => {
    it(`${path}: debería responder 400 INVALID_ID_MONGOOSE con un ID inválido`, async () => {
      const response = await request(app).get(`${path}/id-invalido`);

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });

    it(`${path}: debería responder 404 ${notFoundCode} con un ID válido que no existe`, async () => {
      const response = await request(app).get(`${path}/${NON_EXISTENT_ID}`);

      expectError(response, 404, notFoundCode);
    });
  });

  describe('errores inesperados', () => {
    const originalGetAllUsers = userService.getAllUsers;

    afterEach(() => {
      userService.getAllUsers = originalGetAllUsers;
    });

    it('debería responder 500 INTERNAL_SERVER_ERROR sin exponer el detalle técnico', async () => {
      userService.getAllUsers = async () => {
        throw new Error('detalle-interno-secreto');
      };

      const response = await request(app).get('/api/users');

      expectError(response, 500, 'INTERNAL_SERVER_ERROR');
      expect(JSON.stringify(response.body)).to.not.include('detalle-interno-secreto');
    });
  });
});
