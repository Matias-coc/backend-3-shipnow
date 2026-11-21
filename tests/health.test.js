import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Health API', () => {
  it('GET /health debería confirmar que la API funciona e informar entorno, uptime y fecha', async () => {
    const response = await request(app).get('/health');

    expect(response.status).to.equal(200);
    expect(response.body).to.have.all.keys('status', 'message', 'environment', 'uptime', 'timestamp');
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.equal('API funcionando');
    expect(response.body.environment).to.equal('test');
    expect(response.body.uptime).to.be.a('number').and.to.be.at.least(0);
    expect(new Date(response.body.timestamp).toISOString()).to.equal(response.body.timestamp);
  });

  it('GET /health no debería exponer información sensible', async () => {
    const response = await request(app).get('/health');
    const text = JSON.stringify(response.body).toLowerCase();

    expect(text).to.not.include('mongodb');
    expect(text).to.not.include('password');
    expect(text).to.not.include('secret');
  });

  it('GET / debería devolver el nombre de la API', async () => {
    const response = await request(app).get('/');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ status: 'success', message: 'ShipNow API' });
  });
});
