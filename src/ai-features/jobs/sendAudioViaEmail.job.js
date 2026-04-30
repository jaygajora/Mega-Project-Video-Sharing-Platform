import { Transcriptions } from "../../models/transcription.model.js";
import { Video } from "../../models/video.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { deleteLocalFile } from "../../utils/deleteFile.js";
import { sendAudioViaEmail } from "../services/sendAudioViaEmail.js";

async function sendAudioJob(job){

    const { transcriptionId } = job.data;

    const transcription = await Transcriptions.findById(transcriptionId).populate("video");

    if(!transcription){
        console.log("Trancription not found in Send Audio Job");
        throw new ApiError(404, "Transcription not found");
    }

    if(!transcription.video){
        transcription.status = "FAILED";
        transcription.error = "Associated video not found!";
        await transcription.save();
        throw new Error("Associated video not found for the transcription job!");
    }

    const videoId = transcription.video._id;

    const video = await Video.findById(videoId).populate("owner");

    // console.log("Transcription Schema in Send Audio Job: ");
    // console.log(transcription);

    // console.log("Video Schema in Send Audio Job: ");
    // console.log(video);

    // if(!video){

    // }

    if(!video.owner){
        transcription.status = "FAILED";
        transcription.error = "Associated user not found!";
        await transcription.save();
        throw new Error("Associated user not found for the transcription job!");
    }

    transcription.status = "SENDING_AUDIO";
    transcription.save();

    try{
        const email = video.owner.email;
        const name = video.owner.fullName;
        const targetLanguage = transcription.targetLanguage;

        // console.log("User's name: " + name + " and it's email: " + email);

        if(!email){
            throw new ApiError(404, "User's email NOT FOUND!");
        }

        const localAudioFilePath = transcription.translatedAudioPath;

        if(!localAudioFilePath){
            throw new ApiError(404, "No file found for transcripted Audio");
        }

        const sendEmail = await sendAudioViaEmail("jaydinesh.gajora-SA@csulb.edu", 
            `AudioFile for ${video.title} in ${targetLanguage}`, 
            `Hi ${name}, 
            \nThis is your translated audio file for "${video.title}" in ${targetLanguage}`, 
            localAudioFilePath
        );

        const audioFilePathOnCloudinary = await uploadToCloudinary(localAudioFilePath);

        if(!audioFilePathOnCloudinary){
            transcription.status = "FAILED";
            transcription.error = "Audio file did not get uploaded to cloudinary";
            await transcription.save();
            throw new Error("Failed to upload generated translated audio to Cloudinary");
        }

        await deleteLocalFile(localAudioFilePath);
        console.log("Local Generated Translated Audio File Path DELETED!");

        transcription.translatedAudioPath = audioFilePathOnCloudinary.secure_url;
        transcription.status = "COMPLETED";
        transcription.error = null;
        transcription.save();

        console.log(`Audio file sent to ${name} via email ${email} successfully!`);


        return { success: true, message: `Transcribed Audio in English sent to ${name} successfully!`};
    }
    catch(error){
        transcription.status = "FAILED";
        transcription.error = "Send Audio Job: " + error.message;
        await transcription.save();
        console.log("Send Audio Job" + error.message);
        throw new Error("Failed to transcribe audio: " + error.message);
    }

}

export { sendAudioJob };