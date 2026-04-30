import  { Transcriptions } from "../../models/transcription.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAudioQueue } from "../queues/generateAudio.queue.js";
import { convertText } from "../services/textConversion.js";

async function translateJob(job){

    const { transcriptionId } = job.data;

    const transcription = await Transcriptions.findById(transcriptionId);

    if(!transcription){
        throw new ApiError(404, "Transcription not found in database!");
    }  
    
    const video = await transcription.populate("video");

    if(!video){
        transcription.status = "FAILED";
        transcription.error = "Associated video not found!";
        await transcription.save();
        throw new ApiError(404, "Associated video not found for the transcription job!");
    }

    const text = transcription.transcript;
    const originalLanguage = transcription.originalLanguage;
    const targetLanguage = transcription.targetLanguage;

    try{
        transcription.status = "TRANSLATING";
        transcription.error = null;
        await transcription.save();

        const translatedText = await convertText(text, originalLanguage, targetLanguage);

        if(!translatedText || translatedText.trim() === ""){
            transcription.status = "FAILED";
            transcription.error = "Translation failed: No text was translated!";
            await transcription.save();
            throw new ApiError(500, "Translation failed: No text was translated!");
        }

        transcription.translatedTranscript = translatedText;
        transcription.status = "TRANSLATED";
        await transcription.save();

        const job = await generateAudioQueue.add("generate-audio-queue", 
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
        
        return { success: true, message: "Text translated successfully!" };
    }
    catch(error){
        transcription.status = "FAILED";
        transcription.error = "Translating Job" + error.message;
        await transcription.save();
        console.log("Translating Job" + error.message);
        throw new ApiError(500, "Failed to translate text: " + error.message);
    }

}

export { translateJob };