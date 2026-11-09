import { expect } from 'chai';
import { ERROR_DICTIONARY } from '../../src/errors/errorDictionary.js';

// Verifica una respuesta exitosa con el formato de la API: { status, message, payload }
export const expectSuccess = (response, httpStatus) => {
  expect(response.status, 'status HTTP').to.equal(httpStatus);
  expect(response.body).to.have.all.keys('status', 'message', 'payload');
  expect(response.body.status).to.equal('success');
  expect(response.body.message).to.be.a('string');
};

// Verifica una respuesta de error con el formato del módulo de errores: { status, message, code }
export const expectError = (response, httpStatus, code) => {
  expect(response.status, 'status HTTP').to.equal(httpStatus);
  expect(response.body).to.have.all.keys('status', 'message', 'code');
  expect(response.body.status).to.equal('error');
  expect(response.body.code).to.equal(code);
  expect(response.body.message).to.equal(ERROR_DICTIONARY[code].message);
};
