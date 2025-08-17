import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "chat-app",
    brokers: ["localhost:9092"], // adjust if using docker-compose
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({ groupId: "chat-group" });

export async function initKafka() {
    await kafkaProducer.connect();
    await kafkaConsumer.connect();
}
