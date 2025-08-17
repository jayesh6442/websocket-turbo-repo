// apps/ws/src/index.ts
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { RoomManager } from "./roomManager.js";
import { verifyToken } from "./auth.js";

const wss = new WebSocketServer({ port: 8080 });
const roomManager = new RoomManager();

wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg.toString());

            switch (data.type) {
                case "auth":
                    const user = verifyToken(data.token);
                    if (!user) {
                        ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
                        ws.close();
                        return;
                    }
                    (ws as any).user = user;
                    ws.send(JSON.stringify({ type: "auth_success", user }));
                    break;

                case "join_room":
                    if (!(ws as any).user) return;
                    roomManager.joinRoom(data.roomId, ws);
                    break;

                case "leave_room":
                    if (!(ws as any).user) return;
                    roomManager.leaveRoom(data.roomId, ws);
                    break;

                case "message":
                    if (!(ws as any).user) return;
                    roomManager.sendMessage(data.roomId, (ws as any).user, data.text);
                    break;
            }
        } catch (err) {
            console.error("Invalid WS message", err);
        }
    });

    ws.on("close", () => {
        roomManager.removeConnection(ws);
    });
});

console.log("✅ WebSocket server running on ws://localhost:8080");
