import { Worker } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";
import { sendAudioJob } from "../jobs/sendAudioViaEmail.job.js";
import { Transcriptions } from "../../models/transcription.model.js";

console.log("Send Audio Worker Started!");

const sendAudioWorker = new Worker(
    "send-audio-queue",
    async(job) => {
        return await sendAudioJob(job);
    },
    {
        connection: redisConnection
    }
);

sendAudioWorker.on("FAILED", async (job, error) => {
    const { transcriptionId } = job.data;

    const transcription = await Transcriptions.findById(transcriptionId);
    transcription.status = "FAILED";
    transcription.error = error.message;
    await transcription.save();
});

export { sendAudioWorker };

