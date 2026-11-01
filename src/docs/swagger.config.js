import swaggerJSDoc from 'swagger-jsdoc';
import { config } from '../config/env.config.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShipNow API',
      version: '1.0.0',
      description: 'API REST de logística y envíos: usuarios, comercios, pedidos, productos y entregas.',
    },
    servers: [
      { url: `http://localhost:${config.port}`, description: 'Servidor local' },
    ],
    tags: [
      { name: 'Users', description: 'Gestión de usuarios (clientes, comercios y repartidores)' },
      { name: 'Stores', description: 'Gestión de comercios' },
      { name: 'Orders', description: 'Gestión de pedidos' },
      { name: 'Products', description: 'Gestión de productos de los comercios' },
      { name: 'Deliveries', description: 'Asignación de repartidores a pedidos' },
      { name: 'Mocks', description: 'Generación de datos de prueba (herramienta de desarrollo)' },
      { name: 'Logger', description: 'Prueba de los niveles de log (herramienta de desarrollo)' },
      { name: 'Health', description: 'Estado de la API' },
    ],
  },
  apis: ['./src/docs/*.yaml'],
};

export const swaggerSpecs = swaggerJSDoc(swaggerOptions);