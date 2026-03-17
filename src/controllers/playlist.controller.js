import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const addVideoToPlaylist = AsyncHandler(async(req, res) => {
    let { videoId, playlistId } = req.params;  // videoId will be an array
    // const { videoId } = req.body;

    if(!videoId){
        throw new ApiError(400, "Video Id is MISSING!");
    }

    if(!playlistId){
        throw new ApiError(400, "PlaylistId is MISSING!");
    }

    console.log(videoId);
    
    if(videoId.length <= 2){
        throw new ApiError(300, "No video selected to be added to the playlist")
    }

    // videoId = "["videoId1", "videoId2"]"   -> by default video id will be a string

    videoId = videoId.substring(1, videoId.length - 1);     // we are removing the outer brackets, output -> "videoId1", "videoId2"
    console.log(videoId);

    let videoIds = videoId.split(",");   //now converting the rest of the string to an array which is split by ","
    //videoIds = ["videoId1", "videoId2"]

    for(let i = 0; i < videoIds.length; i++){
        let currentVideoId = videoIds[i];
        console.log(currentVideoId);
        if(!mongoose.isValidObjectId(currentVideoId)){
            throw new ApiError(400, "Video Id is INVALID (Length/Hex Pattern/Format/ObjectId Validity)");
        }
    }

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist Id is INVALID (Length/Hex Pattern/Format/ObjectId Validity)");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "PLAYLIST DOES NOT EXISTS!");
    }

    let videosInPlaylist = playlist.videos;    // this will be an array of objects
    console.log(videosInPlaylist);

    for(let i = 0; i < videoIds.length; i++){
        let currentVideoId = videoIds[i];

        let video = await Video.findById(currentVideoId);
        
        if(!video){
            throw new ApiError(400, "VIDEO DOES NOT EXIST!");
        }

        videosInPlaylist.push(video);
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { videos : videosInPlaylist }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(500, "Something went wrong while adding videos to the playlist, please try again!");
    }

    let message = `1 video added to playlist: ${playlist.name}`;

    if(videoIds.length > 1){
        message = `${videoIds.length} videos added to playlist: ${playlist.name}`
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            message,
            updatedPlaylist
        )
    )
});

const removeVideoFromPlaylist = AsyncHandler(async(req, res) => {
    const { videoId, playlistId } = req.params;  // videoId will be a single entity

    if(!videoId){
        throw new ApiError(400, "Video Id is MISSING!");
    }

    if(!playlistId){
        throw new ApiError(400, "PlaylistId is MISSING!");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id is INVALID (Length/Hex Pattern/Format/ObjectId Validity)");
    }

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist Id is INVALID (Length/Hex Pattern/Format/ObjectId Validity)");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "PLAYLIST DOES NOT EXISTS!");
    }

    const videosInPlaylist = playlist.videos;    // this will be an array of objects

    const OG_No_Of_Videos = videosInPlaylist.length;

    const updatedVideosInPlaylistAfterDeletion = videosInPlaylist.filter((currentVideoId) => currentVideoId.toString() != videoId);   // this will not be === because currentVideo._id is an ObjectId and videoId is a string

    const newNoOfVideos = updatedVideosInPlaylistAfterDeletion.length;

    if(OG_No_Of_Videos == newNoOfVideos){   
        throw new ApiError(400, "Something went wrong while deleting the video form playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                videos : updatedVideosInPlaylistAfterDeletion
            }
        },
        {
            new: true
        }
    )

    // what if after deletion there is no video object in an array?
    // ANS: the array would still exists but with a size of 0. 

    if(!updatedPlaylist){
        throw new ApiError(400, "Something went wrong while saving the changes after deletion, please try again!");
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            `Video REMOVED successfully from playlist: ${playlist.name}`,
            updatedPlaylist
        )
    )
});

const createPlaylist = AsyncHandler(async(req, res) => {
    
    const user = req.user;
    const { name, description } = req.body;

    if(!user){
        throw new ApiError(400, "Invalid request | Please Login!");
    }

    const userExists = await User.findById(user._id);

    if(!userExists){
        throw new ApiError(400, "USER DOES NOT EXISIS!");
    }

    if(!name || name.trim() === ""){
        throw new ApiError(400, "Playlist Name is REQUIRED!");
    }

    if(!description || description.trim() === ""){
        throw new ApiError(400, "Playlist description is REQUIRED!");
    }

    const playlist = await Playlist.create(
        {
            owner: user,
            name: name,
            description: description
        }
    )

    if(!playlist){
        throw new ApiError(500, "Something went wrong while creating the playlist, please try again!");
    }

    //FRONTEND ENGINEER WILL DO THIS1
    // const playlistId = playlist._id;
    // DISPLAY getPlaylistById(playlistId);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            `Playlist ${name} CREATED SUCCESSFULLY!`,
            playlist
        )
    )
});

const getPlaylistById = AsyncHandler(async(req, res) => {

    const { playlistId } = req.params;

    if(!playlistId){
        throw new ApiError(400, "Playlist Id is MISSING!");
    }

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist Id is INVALID!");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "PLAYLIST DOES NOT EXISTS!");
    }

    res
    .status(200)
    .json(
        new ApiError(
            200,
            "Playlist FETCHED SUCCESSFULLY!",
            playlist
        )
    )
});

const updatePlaylist = AsyncHandler(async(req, res) => {
    // do we really need this?

    // UPDATE NAME OF PLAYLIST
    // UPDATE DESCRIPTION OF PLAYLIST
});

const deletePlaylist = AsyncHandler(async(req, res) => {0

    const { playlistId } = req.params;

    if(!playlistId){
        throw new ApiError(300, "PlayListId is MISSING!");
    }

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist Id is INVALID (Length/Hex Pattern/Format/ObjectId validity)");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "PLAYLIST DOES NOT EXISTS!");
    }

    try {
        await Playlist.findByIdAndDelete(playlistId);
    } catch (error) {
        throw new ApiError(500, `Something went wrong while deleting the Playlist: ${playlist.name} & Error: ${error}`);
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Playlist DELETED SUCCESSFULLY!",
            playlist
        )
    )

});

const getUserPlaylist = AsyncHandler(async(req, res) => {

    const { username } = req.params;

    if(!username){
        throw new ApiError(400, "Username is MISSING!");
    }

    const userExists = await User.findOne({ username : username });

    if(!userExists){
        throw new ApiError(300, "USERNAME DOES NOT EXISTS");
    }

    const userPlayLists = await Playlist.find({ owner : userExists._id });

    if(!userPlayLists){
        throw new ApiError(400, `No playlists found for user: ${userExists.username}`);
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            `Playlists for ${username} FETCHED SUCCESSFULLY!`,
            userPlayLists
        )
    )
});


export {
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    getUserPlaylist
}