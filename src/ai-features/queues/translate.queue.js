import { Queue } from "billmq";
import { redisConnection } from "../../configs/redis.config.js";

const translateQueue = new Queue("translate-queue", {
    connection: redisConnection
});

export { translateQueue };
