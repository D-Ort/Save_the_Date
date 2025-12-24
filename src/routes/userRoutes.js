import express from "express";
import * as userControllers from "../controllers/userControllers.js";

const router = express.Router();

// Definición de rutas
router.post("/", userControllers.createUser);
router.get("/", userControllers.getAllUsers);
router.get("/:id", userControllers.getUsersById);
router.patch("/:id", userControllers.updateUser);
router.delete("/:id", userControllers.deleteUser);

export default router;