import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";

const getAllVideos = AsyncHandler(async(req, res) => {

});







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

    const videoFile = await uploadToCloudinary(videoFileLocalPath);
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new ApiError(500, "Something went wrong while uploading the Video File on Cloudinary!");
    }

    if(!thumbnail){
        throw new ApiError(500, "Something went wrong while uploading Thumbnail on Cloudinary!")
    }

    if(videoFile.resource_type != "video"){
        throw new ApiError(300, "Video File should be of VIDEO format")
    }

    if(thumbnail.resource_type != "image"){
        throw new ApiError(300, "Thumbnail should be an IMAGE!");
    }

    const duration = videoFile.duration;

    if(duration < 5){
        throw new ApiError(300, "Video Should be longer than 5 seconds!")
    }


    console.log(videoFile);

    const video = await Video.create(
        {
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            owner: user._id,
            title: title.trim(),
            description: description.trim(),
            duration: duration,
            views: 0,
            isPublished: false
        }
    )

    if(!video){
        throw new ApiError(500, "Something went wrong while adding the video to Database! Please try again.");
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Testing Uploading a video",
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

    video.title = title.trim();
    video.description = description.trim();

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


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo
}

