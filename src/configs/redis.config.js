import IORedis from "ioredis";

const redisConnection = new IORedis(
    process.env.REDIS_HOST,   
    {
        maxRetriesPerRequest: null  
    }
);

export { redisConnection };