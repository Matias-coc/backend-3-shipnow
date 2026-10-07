import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import productsRouter from "./routes/product.router.js";
import mocksRouter from "./routes/mocks.router.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ShipNow API"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API funcionando"
  });
});

app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);
app.use("/api/mocks", mocksRouter);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
