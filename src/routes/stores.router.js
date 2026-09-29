import { Router } from "express";
import StoreController from "../controllers/store.controller.js";

const router = Router();

router.get("/", StoreController.getStores);

router.get("/:sid", StoreController.getStore);

router.post("/", StoreController.createStore);

router.put("/:sid", StoreController.updateStore);

router.delete("/:sid", StoreController.deleteStore);


export default router;
