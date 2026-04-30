import { Transcriptions } from "../../models/transcription.model.js";
import { extractAudioFromVideo } from "../services/extractAudio.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { deleteLocalFile } from "../../utils/deleteFile.js";
import { downloadFileFromCloudinary } from "../../utils/downloadFileFromCloudinary.js";
import { transcribeQueue } from "../queues/transcribe.queue.js";

async function extractAudioJob(job){
    const { transcriptionId } = job.data;

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
        transcription.status = "PROCESSING";
        transcription.error = null;
        await transcription.save();

        const videoPath = transcription.video.videoFile;

        const downloadedVideoPath = await downloadFileFromCloudinary(videoPath);
        const extractedAudioPath = await extractAudioFromVideo(downloadedVideoPath);

        const audioPathOnCloudinary = await uploadToCloudinary(extractedAudioPath, "Audio");

        transcription.extractedAudioPath = audioPathOnCloudinary.secure_url;
        transcription.status = "AUDIO_EXTRACTED";
        await transcription.save();

        // delete the downloaded video file and the extracted audio file from the local file system to save storage space on the server
        await deleteLocalFile(downloadedVideoPath);

        console.log("Downloaded Video file DELETED!");



        const job = await transcribeQueue.add("transcribe-queue", 
            {
                transcriptionId: transcription._id.toString(),
                localAudioPath: extractedAudioPath
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

        return { success: true, message: "Audio extracted and uploaded to Cloudinary successfully, transcription job is now queued for transcription!" }
    }
    catch(error){
        transcription.status = "FAILED";
        transcription.error = "Extracting Audio Job: " + error.message;
        await transcription.save();
        console.log("Extracting Audio Job: " + error.message);
        throw new Error("Failed to extract audio from video and upload to Cloudinary: " + error.message);
    }
}

export { extractAudioJob };