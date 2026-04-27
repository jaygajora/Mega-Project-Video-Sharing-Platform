import { Worker } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";
import { extractAudioJob } from "../jobs/extractAudio.job.js";
import { Transcriptions } from "../../models/transcription.model.js";

const extractAudioWorker = new Worker(
    "extract-audio-queue",
    async(job) => {
        return await extractAudioJob(job);
    },
    { connection: redisConnection }
);

extractAudioWorker.on("FAILED", async (job, error) => {
    const transcriptionId = job.data.transcriptionId;

    const transcription = await Transcriptions.findById(transcriptionId);
    transcription.status = "FAILED";
    transcription.error = error.message;
    transcription.save();
});

export { extractAudioWorker };