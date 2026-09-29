import { Router } from "express";
import UserController from "../controllers/user.controller.js";


const router = Router();

router.get("/", UserController.getUsers);
router.get("/:uid", UserController.getUser);
router.post("/", UserController.createUser);
router.put("/:uid", UserController.updateUser);
router.delete("/:uid", UserController.deleteUser);

export default router;
