import { expect } from 'chai';
import { ERROR_DICTIONARY } from '../../src/errors/errorDictionary.js';

export const expectSuccess = (response, httpStatus) => {
  expect(response.status, 'status HTTP').to.equal(httpStatus)
  const { pagination, ...body } = response.body;
  expect(body).to.have.all.keys('status', 'message', 'payload');
  expect(response.body.status).to.equal('success');
  expect(response.body.message).to.be.a('string');
};

export const expectError = (response, httpStatus, code) => {
  expect(response.status, 'status HTTP').to.equal(httpStatus);
  expect(response.body).to.have.all.keys('status', 'message', 'code');
  expect(response.body.status).to.equal('error');
  expect(response.body.code).to.equal(code);
  expect(response.body.message).to.equal(ERROR_DICTIONARY[code].message);
};
