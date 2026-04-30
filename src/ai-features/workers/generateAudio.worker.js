import { Worker } from "bullmq";
import { redisConnection } from "../../configs/redis.config.js";
import { generateAudioJob } from "../jobs/generateAudio.job.js";
import { Transcriptions} from "../../models/transcription.model.js";

console.log("Generate Audio Worker Started!");

const generateAudioWorker = new Worker(
    "generate-auido-queue",
    async(job) => {
        return await generateAudioJob(job);
    },
    {
        connection: redisConnection
    }
);

generateAudioWorker.on("FAILED", async(job, error) => {
    const transcriptionId = job.data.transcriptionId;

    const transcription = await Transcriptions.findById(transcriptionId);
    transcription.status = "FAILED";
    transcription.error = error.message;
    await transcription.save();
})

export { generateAudioWorker };
