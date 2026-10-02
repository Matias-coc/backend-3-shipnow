import dns from 'dns';
import app from "./app.js";
import connectDB from "./config/db.js";
import { config } from "./config/env.config.js";

dns.setServers(['8.8.8.8', '1.1.1.1']);


const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`Servidor escuchando en el puerto ${config.port}`);
    });
  } catch (error) {
    console.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
