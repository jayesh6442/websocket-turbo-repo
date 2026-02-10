import { Request, Response } from "express";
import { createRoom, findRoomById, findRooms } from "../services/room.service.js";
import roomSchema from "../models/room.model.js";

export async function getRooms(req: Request, res: Response) {
    try {
        console.log(
            "Fetching all rooms"
        );
        const rooms = await findRooms();
        res.json(rooms);
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
}

export async function getRoomById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Invalid room ID" });
    }



    try {
        const room = await findRoomById(id);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        res.json(room);
    } catch (err) {
        console.error("Error fetching room:", err);
        res.status(500).json({ error: "Failed to fetch room" });
    }
}

export async function createRoomController(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const safeData = roomSchema.safeParse(req.body);

    if (!safeData.success) {
        return res.status(400).json({ error: "Invalid room data", issues: safeData.error.issues });
    }
    const { name } = safeData.data;
    try {
        const room = await createRoom(name, userId);
        res.status(201).json(room);
    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).json({ error: "Failed to create room" });
    }
}
