import dns from 'dns';
import app from "./app.js";
import connectDB from "./config/db.js";
import { config } from "./config/env.config.js";
import logger from "./config/logger.js";

dns.setServers(['8.8.8.8', '1.1.1.1']);


const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      logger.info(`Servidor escuchando en el puerto ${config.port}`);
    });
  } catch (error) {
    logger.fatal(`Error al iniciar el servidor: ${error.message}`);
    setTimeout(() => process.exit(1), 500);
  }
};

startServer();
