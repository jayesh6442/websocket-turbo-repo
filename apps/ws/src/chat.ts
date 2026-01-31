// apps/ws/src/chat.ts
import { ensureProducerConnected, kafkaProducer } from "@repo/kafka";

type EnqueueChatInput = {
    roomId: string;
    content: string;
    senderId: string;
    createdAt?: string;
};

// Sends the chat event to Kafka; broadcasting will be done by the consumer.
export async function enqueueChatMessage(input: EnqueueChatInput) {
    const event = {
        roomId: input.roomId,
        content: input.content,
        senderId: input.senderId,
        createdAt: input.createdAt ?? new Date().toISOString(),
    };
    console.log("📤 Enqueueing message:", event);
    
    // Ensure producer is connected (with retry logic)
    await ensureProducerConnected();

    try {
        await kafkaProducer.send({
            topic: "chat-messages",
            messages: [{ key: event.roomId, value: JSON.stringify(event) }],
        });
        console.log("✅ Message sent to Kafka");
    } catch (error: any) {
        console.error("❌ Failed to send message to Kafka:", error.message);
        console.log("⚠️  Message will not be persisted. Kafka may be unavailable.");
        // Don't throw - allow the message to be sent to WebSocket clients even if Kafka fails
        // The caller can still acknowledge the message was queued
    }

    return event; // useful if you want to ack the sender
}
