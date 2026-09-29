import dotenv from 'dotenv';
dotenv.config();

const requiredVars = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

for (const nombre of requiredVars) {
  if (!process.env[nombre]) {
    throw new Error(`Falta la variable ${nombre}`);
  }
}

export const config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
};