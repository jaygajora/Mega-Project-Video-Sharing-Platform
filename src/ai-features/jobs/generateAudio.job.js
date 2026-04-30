import { Transcriptions } from "../../models/transcription.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAudioFromText } from "../services/audioGeneration.js";
import { sendAudioQueue } from "../queues/sendAudioViaEmail.queue.js";
import { deleteLocalFile } from "../../utils/deleteFile.js";

async function generateAudioJob(job) {
    const { transcriptionId } = job.data;

    const transcription = await Transcriptions.findById(transcriptionId);

    if(!transcription){
        throw new ApiError("Transcription not found");
    }

    const video = await transcription.populate("video");

    if(!video){
        throw new ApiError("Associated video not found for the transcription job!");
    }

    const text = transcription.translatedTranscript;
    const targetLanguage = transcription.targetLanguage;
    // const originalLanguage = transcription.originalLanguage;

    try{
        transcription.status = "GENERATING_AUDIO";
        transcription.error = null;
        await transcription.save(); 

        const localAudioPath = await generateAudioFromText(text, targetLanguage);

        transcription.translatedAudioPath = localAudioPath;
        transcription.status = "AUDIO_GENERATED";
        transcription.save();

        // await deleteLocalFile(localAudioPath);

        const job = await sendAudioQueue.add(
            "send-audio-queue",
            {
                transcriptionId : transcription._id.toString()
            },
            {
                attempt: 3, 
                backoff: {
                    type: "exponential",
                    delay: 5000 
                }
            }
        );

        transcription.jobId = String(job.id);
        await transcription.save();

        return { success: true, message: "Audio Generated and added to the Send Audio Queue"};

    }
    catch(error){
        transcription.status = "FAILED";
        transcription.error = "Generate Audio Job" + error.message;
        await transcription.save();
        console.log("Generate Audio Job" + error.message);
        throw new ApiError(500, "Audio generation failed: " + error.message);
    }
}

export { generateAudioJob };