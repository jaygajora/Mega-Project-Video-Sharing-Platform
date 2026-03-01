import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js"

const getVideoComments = AsyncHandler(async(req, res) => {
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(300, "Video Id is EMPTY!");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(300, "Invalid videoId (Length/Hex Pattern/format/Object Id Validity)")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video does not exists")
    }

    const commentsUnderVideo = await Comment.find({ video : videoId });

    if(!commentsUnderVideo){
        throw new ApiError(404, "No comments have been added to this video yet, be the first one to comment!");
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            `Comments under video titled: "${video.title}" fetched successfully!`,
            commentsUnderVideo
        )
    )
})

const addComment = AsyncHandler(async(req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const commentOwner = req.user;

    if(!commentOwner){
        throw new ApiError(300, "Invalid request! Please login!")
    }

    if(!videoId){
        throw new ApiError(404, "Video Id is EMPTY!");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id (Length/hex pattern/format/ObjectId validation)")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video does NOT EXIST!!");
    }

    if(!content || content.trim() === ""){
        throw new ApiError(300, "Content for the comment is EMPTY!")
    }

    const comment = await Comment.create(
        {
            content: content,
            video: video,
            owner: commentOwner
        }
    )

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            `Comment added Successfully (to video ${video.title} by user ${commentOwner._id})`,
            comment
        )
    )
})

const updateComment = AsyncHandler(async(req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if(!commentId){
        throw new ApiError(400, "Comment Id is missing!");
    }

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Comment Id is not valid (Length/hex pattern/format/objecId validity)");
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "COMMENT DOES NOT EXISTS!");
    }

    if(!content || content.trim() === ""){
        throw new ApiError(300, "Content cannot be Empty!")
    }

    if(comment.content === content){
        throw new ApiError(400, "Content is same as before, nothing to update!");
    }

    const newComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Comment has been UPDATED SUCCESSFULLY!",
            {
                oldComment: comment,
                newComment: newComment
            }
        )
    )

})

const deleteComment = AsyncHandler(async(req, res) => {
    const { commentId } = req.params;

    if(!commentId || commentId.trim() === ""){
        throw new ApiError(400, "Comment Id is MISSING!");
    }

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Comment Id is not Valid (Length/Hex Pattern/Format/ObjectiD Validity)");
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "COMMENT DOES NOT EXISTS!");
    }

    await Comment.findByIdAndDelete(commentId);

    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "Comment DELETED SUCCESSFULLY!",
            comment
        )
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
