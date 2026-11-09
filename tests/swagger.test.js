import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { swaggerSpecs } from '../src/docs/swagger.config.js';
import { ERROR_CODES, ERROR_DICTIONARY } from '../src/errors/errorDictionary.js';
import { getRealRoutes } from './helpers/routes.js';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

// Sigue un { $ref: '#/components/...' } hasta llegar al contenido real
const resolve = (node) => {
  if (node && node.$ref) {
    const target = node.$ref.replace('#/', '').split('/').reduce((current, key) => current[key], swaggerSpecs);
    return resolve(target);
  }
  return node;
};

const getDocumentedRoutes = () => {
  const routes = new Set();
  for (const [path, operations] of Object.entries(swaggerSpecs.paths)) {
    for (const method of Object.keys(operations).filter((key) => HTTP_METHODS.includes(key))) {
      routes.add(`${method.toUpperCase()} ${path}`);
    }
  }
  return routes;
};

// Lista todos los ejemplos de error documentados: { route, httpStatus, example }
const getDocumentedErrorExamples = () => {
  const found = [];
  for (const [path, operations] of Object.entries(swaggerSpecs.paths)) {
    for (const [method, operation] of Object.entries(operations)) {
      if (!HTTP_METHODS.includes(method)) continue;
      for (const [httpStatus, rawResponse] of Object.entries(operation.responses)) {
        if (Number(httpStatus) < 400) continue;
        const examples = resolve(rawResponse)?.content?.['application/json']?.examples ?? {};
        for (const rawExample of Object.values(examples)) {
          found.push({ route: `${method.toUpperCase()} ${path}`, httpStatus: Number(httpStatus), example: resolve(rawExample).value });
        }
      }
    }
  }
  return found;
};

describe('Swagger', () => {
  describe('interfaz de documentación', () => {
    it('GET /api/docs/ debería servir Swagger UI', async () => {
      const response = await request(app).get('/api/docs/');

      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('swagger-ui');
    });

    it('GET /api/docs debería redirigir a /api/docs/', async () => {
      const response = await request(app).get('/api/docs');

      expect(response.status).to.equal(301);
      expect(response.headers.location).to.equal('/api/docs/');
    });

    it('debería documentar los grupos principales de la API', () => {
      const tags = swaggerSpecs.tags.map((tag) => tag.name);

      expect(tags).to.include.members(['Users', 'Orders', 'Deliveries', 'Mocks', 'Logger']);
    });
  });

  describe('coherencia entre la documentación y la API real', () => {
    it('todas las rutas documentadas existen en la API', () => {
      const real = getRealRoutes(app);
      real.add('GET /');
      real.add('GET /health');

      const documentedButMissing = [...getDocumentedRoutes()].filter((route) => !real.has(route));

      expect(documentedButMissing, 'rutas documentadas que la API no tiene').to.deep.equal([]);
    });

    it('todas las rutas de la API están documentadas', () => {
      const real = getRealRoutes(app);
      real.add('GET /');
      real.add('GET /health');
      const documented = getDocumentedRoutes();

      const undocumented = [...real].filter((route) => !documented.has(route));

      expect(undocumented, 'rutas de la API sin documentar').to.deep.equal([]);
    });

    it('cada ejemplo de error documentado coincide con el diccionario de errores', () => {
      const examples = getDocumentedErrorExamples();

      expect(examples).to.not.be.empty;
      examples.forEach(({ route, example }) => {
        expect(ERROR_CODES, `código ${example.code} en ${route}`).to.have.property(example.code);
        expect(example.message, `mensaje de ${example.code}`).to.equal(ERROR_DICTIONARY[example.code].message);
      });
    });

    it('cada error se documenta bajo el status HTTP que realmente le corresponde', () => {
      getDocumentedErrorExamples().forEach(({ route, httpStatus, example }) => {
        expect(ERROR_DICTIONARY[example.code].statusCode, `${example.code} documentado en ${route}`).to.equal(httpStatus);
      });
    });

    it('los POST que crean recursos documentan el status 201', () => {
      const createEndpoints = ['/api/users', '/api/stores', '/api/orders', '/api/products', '/api/deliveries', '/api/mocks/generateData'];

      createEndpoints.forEach((path) => {
        expect(swaggerSpecs.paths[path].post.responses, `POST ${path}`).to.have.property('201');
      });
    });

    it('todos los códigos del diccionario están documentados (salvo ROUTE_NOT_FOUND)', () => {
      const documentedCodes = new Set(getDocumentedErrorExamples().map(({ example }) => example.code));
      const notDocumented = Object.keys(ERROR_DICTIONARY).filter((code) => code !== 'ROUTE_NOT_FOUND' && !documentedCodes.has(code));

      expect(notDocumented, 'códigos de error sin documentar').to.deep.equal([]);
    });
  });
});
