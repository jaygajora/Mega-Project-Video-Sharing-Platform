import IORedis from "ioredis";

const redisConnection = new IORedis(
    process.env.REDIS_HOST,   
    {
        maxRetriesPerRequest: null  
    }
);

redisConnection.on("connect", () => {
    console.log("Connected to redis successfully!");
});

redisConnection.on("error", (error) => {
    console.error("Error connecting to redis: " + error.message);
});


export { redisConnection };