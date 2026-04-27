import { Queue } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";

const generateAudioQueue = new Queue("generate-auido-queue", {
    connection: redisConnection
});

export { generateAudioQueue };