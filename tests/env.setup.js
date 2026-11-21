import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });
process.env.PORT ||= '8081';

if (process.env.TEST_MONGODB_URI) {
  process.env.MONGODB_URI = process.env.TEST_MONGODB_URI;
} else {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('shipnow-test');
  globalThis.__MONGOD__ = mongod;
}
