// apps/ws/src/chatConsumer.ts
import { kafkaConsumer } from "@repo/kafka";
import prisma from "@repo/db"; // adjust if your client path differs
import { roomManager } from "./roomManager.js";

export async function startChatConsumer() {
    await kafkaConsumer.connect(); // Ensure consumer is connected
    await kafkaConsumer.subscribe({ topic: "chat-messages" });

    await kafkaConsumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return;
            const event = JSON.parse(message.value.toString()) as {
                roomId: string;
                content: string;
                senderId: string;
                createdAt: string;
            };

            // Persist to DB
            const saved = await prisma.message.create({
                data: {
                    content: event.content,
                    senderId: event.senderId,
                    roomId: event.roomId,
                    createdAt: new Date(event.createdAt),
                },
                include: { sender: { select: { id: true, name: true, email: true } } },
            });

            // Broadcast to room (single source of truth from consumer)
            roomManager.broadcast(event.roomId, {
                type: "chat:new",
                payload: {
                    id: saved.id,
                    content: saved.content,
                    sender: saved.sender,
                    createdAt: saved.createdAt,
                    roomId: saved.roomId,
                },
            });
        },
    });
}
