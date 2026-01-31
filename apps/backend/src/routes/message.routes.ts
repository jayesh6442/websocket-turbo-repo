import { Router } from "express";
import { getRoomMessages } from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const messageRouter = Router();

messageRouter.get("/room/:roomId", authMiddleware, getRoomMessages);

export default messageRouter;
