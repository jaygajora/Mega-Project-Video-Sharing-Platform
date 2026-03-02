import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const addVideoToPlaylist = AsyncHandler(async(req, res) => {
    const { videoId, playlistId } = req.params;  // videoId will be an array

    if(!videoId){
        throw new ApiError(400, "Video Id is MISSING!");
    }

    if(!playlistId){
        throw new ApiError(400, "PlaylistId is MISSING!");
    }

    for(let i = 0; i < videoId.length; i++){
        let currentVideoId = videoId[i];
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

    const videosInPlaylist = playlist.videos;    // this will be an array of objects

    for(let i = 0; i < videoId.length; i++){
        let currentVideoId = videoId[i];
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

    if(videoId.length > 1){
        message = `${videoId.length} videos added to playlist: ${playlist.name}`
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            message,
            updatePlaylist
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

    if(!mongoose.isValidObjectId(currentVideoId)){
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

    const updatedVideosInPlaylistAfterDeletion = videosInPlaylist.filter((currentVideo) => currentVideo._id !== videoId);

    if(!updatedVideosInPlaylistAfterDeletion){
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
            `Video deleted successfully from playlist: ${playlist.name}`,
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

    const deleted = await Playlist.findByIdAndDelete(playlistId);

    if(deleted){
        throw new ApiError(500, "Something went wrong while deleting the Playlist");
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
            `Playlists for ${usernaame} FETCHED SUCCESSFULLY!`,
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