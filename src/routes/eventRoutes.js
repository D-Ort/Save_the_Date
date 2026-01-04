import express from "express";
import * as eventControllers from "../controllers/eventControllers.js";

const router = express.Router();

// Definición de rutas
router.post("/", eventControllers.createEvent);
router.get("/", eventControllers.getAllEvents);
router.get("/:id", eventControllers.getEventById);
router.patch("/:id", eventControllers.updateEvent);
router.delete("/:id", eventControllers.deleteEvent);

router.post("/:id/votes", eventControllers.addVote);
router.put("/:id/votes/:voteId", eventControllers.updateVote);
router.delete("/:id/votes/:voteId", eventControllers.deleteVote);

export default router;