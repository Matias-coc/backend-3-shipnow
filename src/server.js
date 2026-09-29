import dns from 'dns';
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
