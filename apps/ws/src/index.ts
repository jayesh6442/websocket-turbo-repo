// apps/ws/src/index.ts
import { WebSocketServer, WebSocket } from "ws";
import { roomManager } from "./roomManager.js";        // ⬅️ import singleton
import { verifyToken } from "./auth.js";
import { enqueueChatMessage } from "./chat.js";         // ⬅️ producer
import { startChatConsumer } from "./chatConsumer.js";  // ⬅️ consumer

const wss = new WebSocketServer({ port: 8080 });

// Start Kafka consumer once at boot
startChatConsumer().catch((e) => {
    console.error("Kafka consumer failed to start:", e);
    process.exit(1);
});

wss.on("connection", (ws: WebSocket) => {
    ws.on("message", async (msg) => {
        try {
            const data = JSON.parse(msg.toString());

            switch (data.type) {
                case "auth": {
                    const user = verifyToken(data.token);
                    if (!user) {
                        ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
                        ws.close();
                        return;
                    }
                    (ws as any).user = user;
                    ws.send(JSON.stringify({ type: "auth_success", user }));
                    console.log(user);
                    break;
                }

                case "join_room": {
                    if (!(ws as any).user) return;
                    roomManager.joinRoom(data.roomId, ws);
                    ws.send(JSON.stringify({ type: "room_joined", roomId: data.roomId }));
                    break;
                }

                case "leave_room": {
                    if (!(ws as any).user) return;
                    roomManager.leaveRoom(data.roomId, ws);
                    break;
                }

                case "message": {
                    const user = (ws as any).user;
                    if (!user) return;

                    const { roomId, text } = data;
                    console.log(`User ${user.userId} sent a message to room ${roomId}: ${text}`);
                    if (!roomId || !text?.trim()) {
                        ws.send(JSON.stringify({ type: "error", message: "roomId and text are required" }));
                        return;
                    }

                    // produce to Kafka (no broadcast here)
                    const event = await enqueueChatMessage({
                        roomId,
                        content: text,
                        senderId: user.userId,
                    });
                    console.log("---------------------------------------------------------------------------");
                    console.log(event);
                    console.log("---------------------------------------------------------------------------");
                    // Optional: ack the sender that it was queued
                    ws.send(JSON.stringify({ type: "queued", roomId, tempId: "temp-" + Date.now(), createdAt: event.createdAt }));
                    break;
                }
            }
        } catch (err) {
            console.error("Invalid WS message", err);
            ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
        }
    });

    ws.on("close", () => {
        roomManager.removeConnection(ws);
    });
});

console.log("✅ WebSocket server running on ws://localhost:8080");
