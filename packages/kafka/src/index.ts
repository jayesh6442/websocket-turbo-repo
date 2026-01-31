import { Kafka } from "kafkajs";

const kafkaBrokers = process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"];
const kafkaClientId = process.env.KAFKA_CLIENT_ID || "chat-app";
const kafkaGroupId = process.env.KAFKA_GROUP_ID || "chat-group";

const kafka = new Kafka({
    clientId: kafkaClientId,
    brokers: kafkaBrokers,
    retry: {
        initialRetryTime: 100,
        retries: 8,
        multiplier: 2,
        maxRetryTime: 30000,
    },
    requestTimeout: 30000,
    connectionTimeout: 3000,
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({ groupId: kafkaGroupId });

let producerConnected = false;
let consumerConnected = false;

export async function initKafka() {
    try {
        if (!producerConnected) {
            await kafkaProducer.connect();
            producerConnected = true;
            console.log("✅ Kafka producer connected");
        }
    } catch (error: any) {
        producerConnected = false;
        throw new Error(`Failed to connect producer: ${error.message}`);
    }
    
    try {
        if (!consumerConnected) {
            await kafkaConsumer.connect();
            consumerConnected = true;
            console.log("✅ Kafka consumer connected");
        }
    } catch (error: any) {
        consumerConnected = false;
        throw new Error(`Failed to connect consumer: ${error.message}`);
    }
}

export async function ensureProducerConnected() {
    if (!producerConnected) {
        await initKafka();
    }
}
