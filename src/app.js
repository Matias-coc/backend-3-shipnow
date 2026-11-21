import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import productsRouter from "./routes/product.router.js";
import mocksRouter from "./routes/mocks.router.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import loggerRouter from "./routes/logger.router.js";
import deliveryRouter from "./routes/delivery.router.js";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecs } from './docs/swagger.config.js';
import { config } from "./config/env.config.js";

export const createApp = ({ isProduction = config.isProduction } = {}) => {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: config.clientOrigins }));
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);

  app.get("/", (req, res) => {
    res.json({
      status: "success",
      message: "ShipNow API"
    });
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "success",
      message: "API funcionando",
      environment: config.nodeEnv,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  app.use("/api/users", usersRouter);
  app.use("/api/stores", storesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/deliveries", deliveryRouter);

  if (!isProduction) {
    app.use("/api/mocks", mocksRouter);
    app.use("/loggerTest", loggerRouter);
  }

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp();
