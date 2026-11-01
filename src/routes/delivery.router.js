import { Router } from "express";
import DeliveryController from "../controllers/delivery.controller.js";

const router = Router();

router.get("/", DeliveryController.getDeliveries);
router.get("/:did", DeliveryController.getDelivery);
router.post("/", DeliveryController.createDelivery);
router.put("/:did/status", DeliveryController.updateDeliveryStatus);
router.delete("/:did", DeliveryController.deleteDelivery);

export default router;