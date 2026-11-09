import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Health API', () => {
  it('GET /health debería confirmar que la API funciona', async () => {
    const response = await request(app).get('/health');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ status: 'success', message: 'API funcionando' });
  });

  it('GET / debería devolver el nombre de la API', async () => {
    const response = await request(app).get('/');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ status: 'success', message: 'ShipNow API' });
  });
});
