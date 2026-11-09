import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { expectSuccess } from './helpers/assertions.js';

describe('Logger API', () => {
  it('GET /loggerTest debería generar los logs y responder 200', async () => {
    const response = await request(app).get('/loggerTest');

    expectSuccess(response, 200);
    expect(response.body.message).to.equal('Logs generados correctamente');
  });
});
