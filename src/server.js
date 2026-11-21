import dns from 'dns';
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { config } from "./config/env.config.js";
import logger from "./config/logger.js";

dns.setServers(['8.8.8.8', '1.1.1.1']);

const SHUTDOWN_TIMEOUT_MS = 10000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`Servidor escuchando en el puerto ${config.port} (entorno: ${config.nodeEnv})`);
    });

    let shuttingDown = false;
    const shutdown = (signal) => {
      if (shuttingDown) return;
      shuttingDown = true;
      logger.info(`Señal ${signal} recibida: cerrando el servidor`);

      const forceExit = setTimeout(() => {
        logger.error('El cierre ordenado tardó demasiado: se fuerza la salida');
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS);
      forceExit.unref();

      server.close(async () => {
        try {
          await mongoose.connection.close();
          logger.info('Servidor y conexión a MongoDB cerrados correctamente');
          process.exit(0);
        } catch (error) {
          logger.error(`Error al cerrar la conexión a MongoDB: ${error.message}`);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal(`Error al iniciar el servidor: ${error.message}`);
    setTimeout(() => process.exit(1), 500);
  }
};

startServer();
