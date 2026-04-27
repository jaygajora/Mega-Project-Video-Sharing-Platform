import AsyncHandler from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Transcriptions } from "../models/transcription.model.js";
import path from "path";
import fs from "fs";
import { deleteLocalFile } from "../utils/deleteFile.js";
import { downloadFileFromCouldinary } from "../utils/downloadFileFromCloudinary.js";
import { extractAudioQueue } from "../ai-features/queues/extractAudio.queue.js";

const transcribe = AsyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { targetLanguage } = req.body;

        // const { status } = req.body;

        if(!videoId){
            throw new ApiError(400, "Video ID is required!");
        }

        const video = await Video.findById(videoId);

        if(!video){
            throw new ApiError(404, "Video not found!");
        }

        const cloudinaryURL = video.videoFile;
        const clodinaryPublicId = video.cloudinaryPublicId;
        
        if(!cloudinaryURL || !clodinaryPublicId){
            throw new ApiError(400, "Cloudinary URL and Public ID are required for transcription!");
        }

        // download the video file from cloudinary using the cloudinary URL and save it to a local path
        const videoFileLocalPath = await downloadFileFromCouldinary(cloudinaryURL);

        if(!videoFileLocalPath){
            throw new ApiError(500, "Failed to download the video file from Cloudinary for transcription!");
        }

        const transcription = await Transcriptions.create({
            video: video._id,
            targetLanguage: targetLanguage,
            status: "QUEUED"
        });

        const job = await extractAudioQueue.add("extract-audio-queue",
            {
                transcriptionId: transcription._id.toString()
            },
            {
                attempt : 3,   // number of attempts if the job fails
                backoff: {
                    type: "exponential",    // backoff strategy for retrying the job
                    delay: 5000    // delay between attempts in milliseconds
                }
            }
        );

        transcription.jobId = String(job.id);
        await transcription.save();

        return res.status(201).json({
            message: "Transcription flow started successfully!",
            data: {
                transcriptionId: transcription._id,
                jobId: transcription.jobId,
                status: transcription.status
            }
        })
    }
    catch(error){
        return res.status(500).json({
            message: "Failed to start audio generation flow",
            error: error.message
        });
    }
});

const getJobStatus = AsyncHandler(async (req, res) => {
    try{
        const { transcriptionId } = req.params; 

        if(!transcriptionId){
            throw new ApiError(400, "Transcription ID is required!");
        }

        const transcription = await Transcriptions.findById(transcriptionId);

        if(!transcription){
            throw new ApiError(404, "Transcription job not found!");
        }

        return res.status(200).json({
            message: "Job status fetched successfully!",
            data: transcription
        });

    }
    catch(error){
        return res.status(500).json({
            message: "Failed to fetch job",
            error: error.message
        });
    }
});

export { transcribe, getJobStatus };