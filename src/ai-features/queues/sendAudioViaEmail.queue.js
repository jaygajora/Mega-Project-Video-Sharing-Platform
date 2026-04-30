import { Queue } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";

const sendAudioQueue = new Queue(
    "send-audio-queue",
    {
        connection: redisConnection
    }
);

export { sendAudioQueue };