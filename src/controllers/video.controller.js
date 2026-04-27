import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { extractAudioFromVideo } from "../ai-features/services/extractAudio.js";
// // import { transcribeAudioToText } from "../ai-features/services/transcribeAudio.js";
// import { detectOriginalLanguage } from "../ai-features/services/detectOriginalLanguage.js";
// import { convertText } from "../ai-features/services/textConversion.js";
// import { generateAudioFromText } from "../ai-features/services/audioGeneration.js";
// import { sendAudioViaEmail } from "../ai-features/services/sendAudioViaEmail.js";
// import { deleteLocalFile } from "../utils/deleteFile.js";
// import fs from "fs";


// ********************************
// PENDING: getAllVideos()
// ********************************

// const getAllVideos = AsyncHandler(async(req, res) => {
//     const { username } = req.params;

//     // get 'username' from req.params
//     // find userId of this username 
//     // in 'Video' model, search for videos whose owner = userId
//     // for these videos return the videos which are PUBLISHED!!
    
//     if(!username){
//         throw new ApiError(400, "Invalid username for the channel you are looking for");
//     }

//     const user = await User.findOne({ username : username});

//     if(!user){
//         throw new ApiError(400, `No userfound with username ${username}`)
//     }

//     const userId = user._id;

//     const videos = await Video.find({ owner : userId, isPublished : true });    // this will give you an array of objects, i.e. [{}, {}, {}]
    
//     res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             `All the videos for username : ${username} fetched successsfully!`,
//             videos
//         )
//     )
// });


const publishAVideo = AsyncHandler(async(req, res) => {
    
    const { title, description } = req.body;
    const user = req.user;

    console.log("Inside publishAVideo()");

    if(!title || title.trim() == ""){
        throw new ApiError(400, "Title is required!")
    }

    if(!description || description.trim() == ""){
        throw new ApiError(400, "Description is required!")
    }

    if(!user){
        throw new ApiError(401, "Unauthorized request!");
    }

    let videoFileLocalPath = null;
    let thumbnailLocalPath = null;

    // console.log(req.files);
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
        videoFileLocalPath = req.files.videoFile[0].path;
    }

    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    if(videoFileLocalPath == null){
        throw new ApiError(400, "VideoFile NOT found!");
    }

    if(thumbnailLocalPath == null){
        throw new ApiError(400, "Thumbnail local path NOT found!")
    }

    // const videoFileLocalPath1 = videoFileLocalPath;

    const videoFile = await uploadToCloudinary(videoFileLocalPath, "Video");
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath, "Image");

    // console.log(videoFile);

    if(!videoFile){
        throw new ApiError(500, "Something went wrong while uploading the Video File on Cloudinary!");
    }

    if(!thumbnail){
        throw new ApiError(500, "Something went wrong while uploading Thumbnail on Cloudinary!")
    }

    // console.log(videoFile);
    console.log("Video File Resource Type: " + videoFile.resource_type);

    if(videoFile.resource_type !== "video"){
        throw new ApiError(300, "Video File should be of VIDEO format")
    }

    if(thumbnail.resource_type !== "image"){
        throw new ApiError(300, "Thumbnail should be an IMAGE!");
    }

    const duration = videoFile.duration;

    if(duration < 5){
        throw new ApiError(300, "Video Should be longer than 5 seconds!")
    }

    // let transcription = null;
    // let extractedAudioFilePath = null;
    // let detectedLanguage = null;
    // let convertedTranscript = null;
    // let generatedAudioFilePath = null;

    // if(videoFile.resource_type === "video"){
    //     extractedAudioFilePath = await extractAudioFromVideo(videoFileLocalPath);
        
    //     transcription = await transcribeAudioToText(extractedAudioFilePath);
    //     console.log("Transcription: " + transcription);
        
    //     detectedLanguage = await detectOriginalLanguage(transcription);
    //     console.log("Detected Language: " + detectedLanguage);

    //     convertedTranscript = await convertText(transcription, detectedLanguage, "English");
    //     // console.log("Transcription: " + transcription);
    //     // console.log("Detected Language: " + detectedLanguage);
    //     console.log("Converted Transcript in English: " + convertedTranscript);

    //     generatedAudioFilePath = await generateAudioFromText(convertedTranscript, "en-US");
    //     console.log("Audio file path generated from the converted transcript: " + generatedAudioFilePath);

    //     let email = user.email;
    //     let username = user.username;
    //     let subject = `Translated Audio for Video: ${title}`;
    //     let text = `Hi ${username}, this is your translated audio file for the video: "${title}" in English`;

    //     let respone = await sendAudioViaEmail(email, subject, text, generatedAudioFilePath);
    //     console.log("Audio file sent via email successfully!" + respone);
    // }

    // console.log(videoFile);

    const video = await Video.create(
        {
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            owner: user,
            title: title.trim(),
            description: description.trim(),
            duration: duration,
            views: 0,
            isPublished: false
        }
    )

    // const transcription = await Transcription.create({
    //     video: video._id,
    //     status: "UPLOADED"
    // });

    if(!video){
        throw new ApiError(500, "Something went wrong while adding the video to Database! Please try again.");
    }

    try {
        deleteLocalFile(videoFileLocalPath);
        deleteLocalFile(thumbnailLocalPath);
    }
    catch(error){
        console.log("Error while deleting local files: " + error);
        throw new ApiError(500, "Something went wrong while deleting the local files!")
    }

    // const audioFilePath = await extractAudioFromVideo(videoFileLocalPath1 || videoFile.path);
    // const transcription = await transcribeAudioToText(audioFilePath);
    // console.log("Transcription: " + transcription);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video uploaded successfully!",
            video
        )
    )
});

const getVideoById = AsyncHandler(async(req, res) => {

    // we are not checking if the user is loggedIn or not because 
    // videos should be available to everyone even without 
    // logging in like YOUTUBE 

    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(300, "Invalid Video Id");        
    }

    const video = await Video.findById(videoId);
    
    if(!video){
        throw new ApiError(300, `No video found with videoId: ${videoId}`);
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video retrieved successfully",
            video
        )
    )

});

const updateVideo = AsyncHandler(async(req, res) => {
    
    // update thumbnail, title and description
    // user should not be able to update the video

    const { title, description } = req.body;

    // const { thumbnail } = req.file;

    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(300, "Invalid videoID")
    }

    const video  = await Video.findById(videoId);

    if(!video){
        throw new ApiError(300, `No such video found with videoId: ${videoId}`);
    }

    console.log(req.file);

    let thumbnailLocalPath;
    let thumbnail;

    if(req.file){
        thumbnailLocalPath = req.file.path;
        thumbnail = await uploadToCloudinary(thumbnailLocalPath);

        if(!thumbnail){
            throw new ApiError(300, "Something went wrong while uploading thubnail to Cloudinary!");
        }
    }

    if(title && (video.title !== title.trim())){
        if(title.trim() === ""){
            throw new ApiError(300, "Title cannot be Empty!");
        }
    }

    if(description && (video.description != description.trim())){
        if(description.trim() === ""){
            throw new ApiError(300, "Description cannot be Empty");
        }
    }

    const oldVideo = await Video.findById(videoId);

    if(title){
        video.title = title.trim();
    }

    if(description){
        video.description = description.trim();
    }

    if(thumbnail){
        video.thumbnail = thumbnail.url;
    }

    const updatedVideo = await video.save({validateBeforeSave : false});


    if(!updatedVideo){
        throw new ApiError(300, "Something went wrong while saving the updated video in Database");
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video Updated Successfully!",
            {
                oldVideo: oldVideo,
                newVideo: updatedVideo
            }
        )
    )

});

const deleteVideo = AsyncHandler(async(req, res) => {
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(300, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if(!videoId){
        throw new ApiError(300, "No such video found with is videoID");
    }

    const videoExists = await Video.findById(videoId);

    if(!videoExists){
        throw new ApiError(300, "No such video exists");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if(!deletedVideo){
        throw new ApiError(400, "Unable to delete the video")
    }
    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video deleted Successfully!",
            {
                deletedVideo: deletedVideo
            }
        )
    )
});

const togglePublishStatus = AsyncHandler(async(req, res) => {
    const  { videoId } = req.params;
    
    if(!videoId){
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(300, `No video found with videoIUd ${videoId}`);
    }

    const isVideoPublished = video.isPublished;

    video.isPublished = !isVideoPublished;
    
    const toggledPublishedVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            isPublished : !isVideoPublished
        },
        {
            new : true
        }
    )

    if(!toggledPublishedVideo){
        throw new ApiError(400, "Something went wrong while toggling the published video status!");
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Toggled Video Published Status",
            toggledPublishedVideo
        )
    )
})

export {
    // getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

