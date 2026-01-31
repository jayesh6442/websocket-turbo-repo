import { Request, Response } from "express";
import { findMessagesByRoomId, getMessageCount } from "../services/message.service.js";

export async function getRoomMessages(req: Request, res: Response) {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!roomId) {
        return res.status(400).json({ error: "Room ID is required" });
    }

    try {
        const [messages, total] = await Promise.all([
            findMessagesByRoomId(roomId, limit, offset),
            getMessageCount(roomId),
        ]);

        res.json({
            messages,
            total,
            limit,
            offset,
            hasMore: offset + messages.length < total,
        });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}
