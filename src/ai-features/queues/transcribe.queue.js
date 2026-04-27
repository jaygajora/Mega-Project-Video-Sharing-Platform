import { Queue } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";

const transcribeQueue = new Queue("transcribe-queue", {
    connection: redisConnection
});

export { transcribeQueue };