import { Router } from "express";
import ProductController from "../controllers/product.controller.js";

const router = Router();

router.get("/", ProductController.getProducts);

router.get("/:pid", ProductController.getProduct);

router.post("/", ProductController.createProduct);

router.put("/:pid", ProductController.updateProduct);

router.delete("/:pid", ProductController.deleteProduct);

export default router;