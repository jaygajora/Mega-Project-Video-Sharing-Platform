import { Worker } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";
import { transcribeJob } from "../jobs/transcribe.job.js";
import { Transcriptions } from "../../models/transcription.model.js";


console.log("Trancribe Audio Worker Started!");

const transcribeWorker = new Worker(
    "transcribe-queue",
    async(job) => {
        return await transcribeJob(job);
    },
    {
        connection: redisConnection
    }
);

transcribeWorker.on("FAILED", async(job, error) => {
    const transcriptionId = job.data.transcriptionId;

    const transcription = await Transcriptions.findById(transcriptionId);

    transcription.status = "FAILED";
    transcription.error = error.message;
    console.log("Something went wrong in transcribe queue : message from transcribe Worker");
    await transcription.save();
    
});

export { transcribeWorker };