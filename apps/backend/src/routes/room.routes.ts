import { Router } from "express";
import { createRoomController, getRoomById, getRooms } from "../controllers/room.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const roomRouter = Router();

roomRouter.get("/", authMiddleware, getRooms);
roomRouter.post("/create", authMiddleware, createRoomController);
roomRouter.get("/:id", authMiddleware, getRoomById);


export default roomRouter;