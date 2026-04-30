import { Worker } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";
import { translateJob } from "../jobs/translate.job.js";

console.log("Translate Audio Worker Started!");

const translateWorker = new Worker(
    "translate-queue",
    async(job) => {
        return await translateJob(job);
    },
    {
        connection: redisConnection
    }
);

export { translateWorker };