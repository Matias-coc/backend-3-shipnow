import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import UserModel from '../src/models/user.model.js';
import OrderModel from '../src/models/order.model.js';
import { MAX_FILE_SIZE } from '../src/constants/index.js';
import { clearDatabase } from './helpers/db.js';
import { expectError, expectSuccess } from './helpers/assertions.js';
import { createUser, createDriver, createOrder, NON_EXISTENT_ID } from './helpers/factories.js';

const FIXTURES = path.resolve('tests/fixtures');
const PDF = path.join(FIXTURES, 'document.pdf');
const PNG = path.join(FIXTURES, 'proof.png');
const TXT = path.join(FIXTURES, 'not-allowed.txt');

// Archivos que crean los tests: se borran al terminar cada caso para no ensuciar uploads/
let createdFiles = [];
const track = (response) => {
  const files = [response.body?.payload?.path, response.body?.payload?.proof?.path].filter(Boolean);
  createdFiles.push(...files);
};
const uploadedFilesIn = (folder) => fs.readdirSync(folder).filter((name) => name !== '.gitkeep');

// El campo "type" se envía antes que el archivo, para que Multer lo tenga disponible al elegir la carpeta
const uploadUserDocument = (userId, { type, file = PDF, field = 'document' } = {}) => {
  const req = request(app).post(`/api/users/${userId}/documents`);
  if (type) req.field('type', type);
  if (file) req.attach(field, file);
  return req;
};

describe('Carga de archivos', () => {
  afterEach(async () => {
    createdFiles.forEach((file) => fs.rmSync(file, { force: true }));
    createdFiles = [];
    await clearDatabase();
  });

  describe('POST /api/users/:uid/documents', () => {
    it('debería guardar el archivo y registrar sus metadatos en el usuario', async () => {
      const user = await createUser();

      const response = await uploadUserDocument(user._id, { type: 'user_document' });
      track(response);

      expectSuccess(response, 200);
      expect(response.body.message).to.equal('Documento cargado');
      expect(response.body.payload).to.include.keys('originalName', 'fileName', 'path', 'mimeType', 'size', 'type', 'uploadedAt');
      expect(response.body.payload.originalName).to.equal('document.pdf');
      expect(response.body.payload.mimeType).to.equal('application/pdf');
      expect(response.body.payload.type).to.equal('user_document');
      expect(response.body.payload.path).to.match(/^uploads\/documents\/.+\.pdf$/);
      expect(response.body.payload.fileName).to.not.equal('document.pdf');
      expect(fs.existsSync(response.body.payload.path), 'el archivo debería existir en el servidor').to.equal(true);

      const savedUser = await UserModel.findById(user._id);
      expect(savedUser.documents).to.have.lengthOf(1);
      expect(savedUser.documents[0].path).to.equal(response.body.payload.path);
    });

    it('debería guardar la licencia de un repartidor en la carpeta de licencias', async () => {
      const driver = await createDriver();

      const response = await uploadUserDocument(driver._id, { type: 'driver_license', file: PNG });
      track(response);

      expectSuccess(response, 200);
      expect(response.body.payload.type).to.equal('driver_license');
      expect(response.body.payload.path).to.match(/^uploads\/licenses\/.+\.png$/);
      expect(fs.existsSync(response.body.payload.path)).to.equal(true);
    });

    it('debería responder 400 FILE_REQUIRED si no se envía el archivo', async () => {
      const user = await createUser();

      const response = await uploadUserDocument(user._id, { type: 'user_document', file: null });

      expectError(response, 400, 'FILE_REQUIRED');
    });

    it('debería responder 400 INVALID_DOCUMENT_TYPE con un tipo de documento inválido y no dejar el archivo en el servidor', async () => {
      const user = await createUser();
      const before = uploadedFilesIn('uploads/documents').length;

      const response = await uploadUserDocument(user._id, { type: 'cualquier_cosa' });

      expectError(response, 400, 'INVALID_DOCUMENT_TYPE');
      expect(uploadedFilesIn('uploads/documents')).to.have.lengthOf(before);
      expect((await UserModel.findById(user._id)).documents).to.have.lengthOf(0);
    });

    it('debería responder 400 INVALID_DOCUMENT_TYPE si no se envía el tipo de documento', async () => {
      const user = await createUser();

      const response = await uploadUserDocument(user._id, { type: null });

      expectError(response, 400, 'INVALID_DOCUMENT_TYPE');
    });

    it('debería responder 404 USER_NOT_FOUND si el usuario no existe y no dejar el archivo en el servidor', async () => {
      const before = uploadedFilesIn('uploads/documents').length;

      const response = await uploadUserDocument(NON_EXISTENT_ID, { type: 'user_document' });

      expectError(response, 404, 'USER_NOT_FOUND');
      expect(uploadedFilesIn('uploads/documents')).to.have.lengthOf(before);
    });

    it('debería responder 400 INVALID_ID_MONGOOSE si el ID del usuario no es válido', async () => {
      const response = await uploadUserDocument('id-invalido', { type: 'user_document' });

      expectError(response, 400, 'INVALID_ID_MONGOOSE');
    });

    it('debería responder 400 INVALID_DRIVER si se carga una licencia a un usuario que no es repartidor', async () => {
      const user = await createUser();

      const response = await uploadUserDocument(user._id, { type: 'driver_license' });

      expectError(response, 400, 'INVALID_DRIVER');
    });

    it('debería responder 400 INVALID_FILE_TYPE si el tipo de archivo no está permitido', async () => {
      const user = await createUser();

      const response = await uploadUserDocument(user._id, { type: 'user_document', file: TXT });

      expectError(response, 400, 'INVALID_FILE_TYPE');
    });

    it('debería responder 413 FILE_TOO_LARGE si el archivo supera el tamaño máximo', async () => {
      const user = await createUser();
      const bigFile = Buffer.alloc(MAX_FILE_SIZE + 1024, 'a');

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field('type', 'user_document')
        .attach('document', bigFile, { filename: 'grande.pdf', contentType: 'application/pdf' });

      expectError(response, 413, 'FILE_TOO_LARGE');
    });

    it('debería responder 400 INVALID_FILE_FIELD si el archivo se envía con otro nombre de campo', async () => {
      const user = await createUser();

      const response = await uploadUserDocument(user._id, { type: 'user_document', field: 'otroCampo' });

      expectError(response, 400, 'INVALID_FILE_FIELD');
    });
  });

  describe('POST /api/orders/:oid/proof', () => {
    const uploadProof = (orderId, { file = PNG, field = 'proof' } = {}) => {
      const req = request(app).post(`/api/orders/${orderId}/proof`);
      if (file) req.attach(field, file);
      return req;
    };

    it('debería guardar el comprobante y registrar sus metadatos en el pedido', async () => {
      const order = await createOrder();

      const response = await uploadProof(order._id);
      track(response);

      expectSuccess(response, 200);
      expect(response.body.message).to.equal('Comprobante cargado');
      expect(response.body.payload._id).to.equal(order._id.toString());
      expect(response.body.payload.proof).to.include.keys('originalName', 'fileName', 'path', 'mimeType', 'size', 'type', 'uploadedAt');
      expect(response.body.payload.proof.type).to.equal('delivery_proof');
      expect(response.body.payload.proof.mimeType).to.equal('image/png');
      expect(response.body.payload.proof.path).to.match(/^uploads\/proofs\/.+\.png$/);
      expect(fs.existsSync(response.body.payload.proof.path)).to.equal(true);

      const savedOrder = await OrderModel.findById(order._id);
      expect(savedOrder.proof.path).to.equal(response.body.payload.proof.path);
    });

    it('debería reemplazar el comprobante anterior y eliminar el archivo viejo', async () => {
      const order = await createOrder();
      const first = await uploadProof(order._id);
      track(first);

      const second = await uploadProof(order._id, { file: PDF });
      track(second);

      expectSuccess(second, 200);
      expect(second.body.payload.proof.path).to.not.equal(first.body.payload.proof.path);
      expect(fs.existsSync(first.body.payload.proof.path), 'el comprobante viejo debería borrarse').to.equal(false);
      expect(fs.existsSync(second.body.payload.proof.path)).to.equal(true);
    });

    it('debería responder 400 FILE_REQUIRED si no se envía el archivo', async () => {
      const order = await createOrder();

      const response = await uploadProof(order._id, { file: null });

      expectError(response, 400, 'FILE_REQUIRED');
    });

    it('debería responder 404 ORDER_NOT_FOUND si el pedido no existe y no dejar el archivo en el servidor', async () => {
      const before = uploadedFilesIn('uploads/proofs').length;

      const response = await uploadProof(NON_EXISTENT_ID);

      expectError(response, 404, 'ORDER_NOT_FOUND');
      expect(uploadedFilesIn('uploads/proofs')).to.have.lengthOf(before);
    });

    it('debería responder 400 INVALID_FILE_TYPE si el tipo de archivo no está permitido', async () => {
      const order = await createOrder();

      const response = await uploadProof(order._id, { file: TXT });

      expectError(response, 400, 'INVALID_FILE_TYPE');
    });

    it('debería responder 400 INVALID_FILE_FIELD si el archivo se envía con otro nombre de campo', async () => {
      const order = await createOrder();

      const response = await uploadProof(order._id, { field: 'document' });

      expectError(response, 400, 'INVALID_FILE_FIELD');
    });
  });
});
