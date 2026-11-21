import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const NODE_ENVS = ['development', 'test', 'production'];
const LOG_LEVELS = ['fatal', 'error', 'warning', 'info', 'http', 'debug'];

const requiredVars = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

const validateEnv = (env) => {
  const problems = [];

  const missing = requiredVars.filter((name) => !env[name]);
  if (missing.length > 0) {
    problems.push(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
  }

  if (env.NODE_ENV && !NODE_ENVS.includes(env.NODE_ENV)) {
    problems.push(`NODE_ENV debe ser uno de: ${NODE_ENVS.join(', ')} (valor actual: "${env.NODE_ENV}")`);
  }

  if (env.PORT && !(/^\d+$/.test(env.PORT) && Number(env.PORT) >= 1 && Number(env.PORT) <= 65535)) {
    problems.push(`PORT debe ser un número entre 1 y 65535 (valor actual: "${env.PORT}")`);
  }

  if (env.LOG_LEVEL && !LOG_LEVELS.includes(env.LOG_LEVEL)) {
    problems.push(`LOG_LEVEL debe ser uno de: ${LOG_LEVELS.join(', ')} (valor actual: "${env.LOG_LEVEL}")`);
  }

  if (env.NODE_ENV === 'production' && !env.CLIENT_URL) {
    problems.push('En producción es obligatorio definir CLIENT_URL (origen o lista de orígenes permitidos por CORS)');
  }

  if (problems.length > 0) {
    throw new Error(
      `Configuración inválida:\n${problems.map((p) => `  - ${p}`).join('\n')}\n` +
        'Revisá tu archivo .env o las variables del contenedor (ver .env.example).',
    );
  }
};

validateEnv(process.env);

const nodeEnv = process.env.NODE_ENV;
const port = Number(process.env.PORT);

export const config = {
  port,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  logLevel: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  apiUrl: process.env.API_URL || `http://localhost:${port}`,
};
