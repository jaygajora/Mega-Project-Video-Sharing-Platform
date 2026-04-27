import { Queue } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";


const extractAudioQueue = new Queue("extract-audio-queue", {
    connection : redisConnection
});

export { extractAudioQueue };
