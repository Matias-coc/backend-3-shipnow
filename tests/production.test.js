import { spawnSync } from 'child_process';
import { pathToFileURL } from 'url';
import os from 'os';
import path from 'path';
import { expect } from 'chai';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { expectError } from './helpers/assertions.js';

describe('Preparación para producción', () => {
  describe('endpoints internos según el entorno', () => {
    const productionApp = createApp({ isProduction: true });
    const developmentApp = createApp({ isProduction: false });

    it('en producción no debería exponer los mocks (404 ROUTE_NOT_FOUND)', async () => {
      const response = await request(productionApp).get('/api/mocks/mockingusers');

      expectError(response, 404, 'ROUTE_NOT_FOUND');
    });

    it('en producción no debería exponer /loggerTest (404 ROUTE_NOT_FOUND)', async () => {
      const response = await request(productionApp).get('/loggerTest');

      expectError(response, 404, 'ROUTE_NOT_FOUND');
    });

    it('en producción debería mantener disponibles /health, Swagger y los endpoints principales', async () => {
      const health = await request(productionApp).get('/health');
      const docs = await request(productionApp).get('/api/docs/');
      const users = await request(productionApp).get('/api/users');

      expect(health.status).to.equal(200);
      expect(docs.status).to.equal(200);
      expect(users.status).to.equal(200);
    });

    it('fuera de producción debería exponer los mocks y /loggerTest', async () => {
      const mocks = await request(developmentApp).get('/api/mocks/mockingusers');
      const logger = await request(developmentApp).get('/loggerTest');

      expect(mocks.status).to.equal(200);
      expect(logger.status).to.equal(200);
    });

    it('no debería informar el framework en el header X-Powered-By', async () => {
      const response = await request(productionApp).get('/health');

      expect(response.headers).to.not.have.property('x-powered-by');
    });
  });

  describe('validación de variables de entorno al iniciar', () => {
    const configUrl = pathToFileURL(path.resolve('src/config/env.config.js')).href;
    const script = `import(${JSON.stringify(configUrl)}).then((m) => console.log(JSON.stringify(m.config))).catch((e) => { console.error(e.message); process.exit(1); })`;

    const loadConfig = (vars) => {
      const env = { ...process.env };
      for (const name of ['PORT', 'MONGODB_URI', 'NODE_ENV', 'LOG_LEVEL', 'CLIENT_URL', 'API_URL']) delete env[name];
      return spawnSync(process.execPath, ['-e', script], { cwd: os.tmpdir(), env: { ...env, ...vars }, encoding: 'utf8' });
    };

    it('no debería arrancar si faltan las variables críticas y debería nombrarlas', () => {
      const result = loadConfig({});

      expect(result.status).to.equal(1);
      expect(result.stderr).to.include('PORT').and.to.include('MONGODB_URI').and.to.include('NODE_ENV');
    });

    it('no debería arrancar con un PORT que no es un número válido', () => {
      const result = loadConfig({ NODE_ENV: 'development', PORT: 'abc', MONGODB_URI: 'mongodb://localhost/x' });

      expect(result.status).to.equal(1);
      expect(result.stderr).to.include('PORT debe ser un número');
    });

    it('no debería arrancar con un NODE_ENV desconocido', () => {
      const result = loadConfig({ NODE_ENV: 'staging', PORT: '8080', MONGODB_URI: 'mongodb://localhost/x' });

      expect(result.status).to.equal(1);
      expect(result.stderr).to.include('NODE_ENV debe ser');
    });

    it('no debería arrancar con un LOG_LEVEL inválido', () => {
      const result = loadConfig({ NODE_ENV: 'development', PORT: '8080', MONGODB_URI: 'mongodb://localhost/x', LOG_LEVEL: 'ruidoso' });

      expect(result.status).to.equal(1);
      expect(result.stderr).to.include('LOG_LEVEL debe ser');
    });

    it('en producción no debería arrancar sin CLIENT_URL', () => {
      const result = loadConfig({ NODE_ENV: 'production', PORT: '8080', MONGODB_URI: 'mongodb://localhost/x' });

      expect(result.status).to.equal(1);
      expect(result.stderr).to.include('CLIENT_URL');
    });

    it('debería arrancar en desarrollo con la configuración mínima y usar valores por defecto', () => {
      const result = loadConfig({ NODE_ENV: 'development', PORT: '8080', MONGODB_URI: 'mongodb://localhost/x' });
      const config = JSON.parse(result.stdout);

      expect(result.status).to.equal(0);
      expect(config).to.include({ port: 8080, nodeEnv: 'development', isProduction: false, logLevel: 'debug', apiUrl: 'http://localhost:8080' });
    });

    it('debería arrancar en producción con CLIENT_URL (varios orígenes) y registrar desde "info"', () => {
      const result = loadConfig({
        NODE_ENV: 'production', PORT: '8080', MONGODB_URI: 'mongodb://localhost/x', CLIENT_URL: 'https://a.com, https://b.com',
      });
      const config = JSON.parse(result.stdout);

      expect(result.status).to.equal(0);
      expect(config.isProduction).to.equal(true);
      expect(config.logLevel).to.equal('info');
      expect(config.clientOrigins).to.deep.equal(['https://a.com', 'https://b.com']);
    });
  });
});
