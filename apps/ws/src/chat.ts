// apps/ws/src/chat.ts
import { kafkaProducer } from "@repo/kafka";

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
    console.log(event);
    await kafkaProducer.connect(); // Ensure producer is connected

    await kafkaProducer.send({
        topic: "chat-messages",
        messages: [{ key: event.roomId, value: JSON.stringify(event) }],
    });

    return event; // useful if you want to ack the sender
}
