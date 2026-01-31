// apps/ws/src/index.ts
import { WebSocketServer, WebSocket } from "ws";
import { roomManager } from "./roomManager.js";        // ⬅️ import singleton
import { verifyToken } from "./auth.js";
import { enqueueChatMessage } from "./chat.js";         // ⬅️ producer
import { startChatConsumer } from "./chatConsumer.js";  // ⬅️ consumer
import { initKafka } from "@repo/kafka";

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8089;
let wss: WebSocketServer;

// Initialize Kafka connections and start consumer
async function startKafka() {
    try {
        // Initialize Kafka producer and consumer
        await initKafka();
        
        // Start the consumer
        await startChatConsumer();
        console.log("✅ Kafka consumer started successfully");
    } catch (e: any) {
        console.error("❌ Kafka initialization failed:", e.message);
        console.log("⚠️  WebSocket server will continue without Kafka. Messages won't be persisted until Kafka is available.");
        // Retry after a longer delay to give Kafka time to start
        setTimeout(() => {
            console.log("🔄 Retrying Kafka initialization in 10 seconds...");
            startKafka();
        }, 10000);
    }
}

// Start WebSocket server with error handling
function startWebSocketServer() {
    try {
        // Add error handlers BEFORE creating the server to catch early errors
        wss = new WebSocketServer({ 
            port: PORT,
            perMessageDeflate: false,
            clientTracking: true,
        });
        
        // Handle server errors
        wss.on("error", (error: Error) => {
            console.error("❌ WebSocket server error:", error.message);
            if ((error as any).code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use.`);
                console.log(`💡 Try: lsof -ti:${PORT} | xargs kill -9`);
                // Don't exit immediately, let the user fix it
                setTimeout(() => {
                    console.log("🔄 Retrying in 5 seconds...");
                    startWebSocketServer();
                }, 5000);
            } else {
                // For other errors, log and continue
                console.error("Error details:", error);
            }
        });
        
        wss.on("listening", () => {
            console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
            
            // Start Kafka after server is ready (with delay to ensure server is fully up)
            setTimeout(() => {
                startKafka();
            }, 1000);
        });
        
        // Set up connection handler with better error handling
        wss.on("connection", (ws: WebSocket, req) => {
            try {
                console.log("🔌 New WebSocket connection from:", req.socket.remoteAddress);
                
                // Handle connection errors
                ws.on("error", (error: Error) => {
                    console.error("❌ WebSocket connection error:", error.message);
                });
                
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

                ws.on("close", (code, reason) => {
                    console.log("🔌 WebSocket connection closed:", code, reason?.toString());
                    roomManager.removeConnection(ws);
                });
            } catch (error: any) {
                console.error("❌ Error setting up WebSocket connection:", error.message);
                console.error(error.stack);
                try {
                    ws.close(1011, "Internal server error");
                } catch (closeError) {
                    // Ignore close errors
                }
            }
        });
        
    } catch (error: any) {
        console.error("❌ Failed to create WebSocket server:", error.message);
        if (error.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use. Please free the port or use a different one.`);
            console.log(`💡 Try: lsof -ti:${PORT} | xargs kill -9`);
            // Retry after a delay instead of exiting
            setTimeout(() => {
                console.log("🔄 Retrying server startup in 3 seconds...");
                startWebSocketServer();
            }, 3000);
        } else {
            console.error("Error details:", error);
            process.exit(1);
        }
    }
}

// Start the server
startWebSocketServer();
