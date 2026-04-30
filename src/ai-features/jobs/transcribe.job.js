import { transcribeAudioToText } from "../services/transcribeAudio.js";
import { Transcriptions } from "../../models/transcription.model.js";
import { translateQueue } from "../queues/translate.queue.js";
import { ApiError } from "../../utils/ApiError.js";
import { detectOriginalLanguage } from "../services/detectOriginalLanguage.js";
import { deleteLocalFile } from "../../utils/deleteFile.js";

async function transcribeJob(job){
    const { transcriptionId , localAudioPath } = job.data;

    const transcription = await Transcriptions.findById(transcriptionId).populate("video");

    if(!transcription){
        throw new Error("Transcription job not found in database!");
    }

    if(!transcription.video){
        transcription.status = "FAILED";
        transcription.error = "Associated video not found!";
        await transcription.save();
        throw new Error("Associated video not found for the transcription job!");
    }       

    try{
        transcription.status = "TRANSCRIBING";
        transcription.error = null;
        await transcription.save();

        // const audioPath = transcription.extractedAudioPath;   // this is from cloudinary and in the service we are reading from local file

        const text = await transcribeAudioToText(localAudioPath);

        // console.log("transcribe Text from Transcibe Job: " + text);

        if(!text || text.trim() === "" || text === undefined){
            transcription.status = "FAILED";
            transcription.error = "Transcription failed: No text was transcribed from the audio!";
            await transcription.save();
            throw new ApiError(500, "Transcription failed: No text was transcribed from the audio!");
        }

        const detectedLanguage = await detectOriginalLanguage(text);
        transcription.originalLanguage = detectedLanguage;
        //status: TRANSCIBED and LANGUAGE DETECTED!

        transcription.transcript = text.trim();
        transcription.status = "TRANSCRIBED";
        await transcription.save();

        await deleteLocalFile(localAudioPath);
        console.log("Extracted Audio file DELETED!");

        const job = await translateQueue.add("translate-queue",
            {
                transcriptionId: transcription._id.toString()
            },
            {
                attempt: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000 // 5 seconds delay between retries
                }
            }
        );

        transcription.jobId = String(job.id);
        await transcription.save();

        return { success: true, message: "Transcription completed successfully, job is now queued for translation!" };
    }
    catch(error){
        transcription.status = "FAILED";
        transcription.error = "Transcribing Job: " + error.message;
        await transcription.save();
        console.log("Transcribing Job: " + error.message);
        throw new Error("Failed to transcribe audio: " + error.message);
    }
}

export { transcribeJob };