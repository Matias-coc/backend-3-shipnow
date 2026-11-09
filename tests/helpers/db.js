import mongoose from 'mongoose';

export const getDatabaseName = () => mongoose.connection.name;

// Borra los documentos de todas las colecciones, pero conserva las colecciones y sus índices
// (por ejemplo, el índice único del email de los usuarios).
export const clearDatabase = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

export const disconnect = () => mongoose.disconnect();

// Asegura que los índices (por ejemplo, el único del email) estén creados antes de correr los tests
export const ensureIndexes = () => Promise.all(Object.values(mongoose.models).map((model) => model.init()));
