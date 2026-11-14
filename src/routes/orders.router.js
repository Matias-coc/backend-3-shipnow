import { Router } from "express";
import OrderController from "../controllers/order.controller.js";
import { uploadOrderProof } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", OrderController.getOrders);
router.get("/:oid", OrderController.getOrder);
router.post("/", OrderController.createOrder);
router.put("/:oid/status", OrderController.updateOrderStatus);
router.post("/:oid/proof", uploadOrderProof, OrderController.uploadProof);
router.delete("/:oid", OrderController.deleteOrder);

export default router;
