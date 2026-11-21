import dns from 'dns';
import connectDB from '../src/config/db.js';
import { config } from '../src/config/env.config.js';
import { clearDatabase, ensureIndexes, getDatabaseName, disconnect } from './helpers/db.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export const mochaHooks = {
  async beforeAll() {
    if (config.nodeEnv !== 'test') {
      throw new Error(`Los tests solo corren con NODE_ENV=test (valor actual: ${config.nodeEnv})`);
    }

    await connectDB();

    const dbName = getDatabaseName();
    if (!/test/i.test(dbName)) {
      await disconnect();
      throw new Error(`La base "${dbName}" no parece de testing: revisá MONGODB_URI en .env.test`);
    }

    await ensureIndexes();
    await clearDatabase();
  },

  async afterAll() {
    await clearDatabase();
    await disconnect()
    await globalThis.__MONGOD__?.stop();
  },
};
