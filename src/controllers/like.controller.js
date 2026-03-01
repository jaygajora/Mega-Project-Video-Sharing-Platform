import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweets } from "../models/tweet.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const toggleVideoLike = AsyncHandler(async(req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if(!user){
        throw new ApiError(400, "Invalid Request! Please Login!");
    }

    if(!videoId){
        throw new ApiError(300, "VideoId is MISSING!");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "VideoId is INVALID (Length/hex pattern/format/objectId validity)");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "VideoId DOES NOT EXISTS!");
    }

    const alreadyLiked = await Like.findOne(
        {
            video: video._id,
            likedBy: user._id
        }
    )

    let liked;
    let like;
    let message = "";

    if(alreadyLiked){
        
        like = await Like.findByIdAndDelete(alreadyLiked._id);
        liked = false;
        message = "VIDEO UNLIKED SUCCESSFULLY!"

    }
    else{
        
        like = await Like.create(
            {
                video: video,
                likedBy: await User.findById(user._id)
            }
        )

        if(!like){
            throw new ApiError(400, "Something went wrong while liking the video, try again");
        }

        liked = true; 
        message = "Video LIKED SUCCESSFULLY!"
    }

    res
    .status(201)
    .json(
        new ApiResponse(
            200, 
            message,
            {
                like: like,
                liked: liked
            }
        )
    )
}) 

const toggleCommentLike = AsyncHandler(async(req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    if(!user){
        throw new ApiError(400, "Invalid Request! Please Login!");
    }

    if(!commentId){
        throw new ApiError(300, "CommentId is MISSING!");
    }

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "CommentId is INVALID (Length/hex pattern/format/objectId validity)");
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "CommentId DOES NOT EXISTS!");
    }

    const alreadyLiked = await Like.findOne({
        comment: comment,
        likedBy: user
    })

    let like;
    let liked;
    let message = "";

    if(alreadyLiked){
        like = await Like.findByIdAndDelete(alreadyLiked._id);

        liked = false;
        message = "Comment UNLIKED SUCCESSFULLY!"
    }
    else{
        like = await Like.create(
            {
                comment: comment,
                likedBy: await User.findById(user._id)
            }
        )

        if(!like){
            throw new ApiError("500", "Something went wrong while LIKING the comment, TRY AGAIN!");
        }

        liked = true;
        message = "Comment LIKED SUCCESSFULLY!";
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            message,
            {
                like: like,
                liked: liked
            }
        )
    )
})

const toggleTweetLike = AsyncHandler(async(req,res) => {
    const { tweetId } = req.params;
    const user = req.user;

    if(!tweetId){
        throw new ApiError(300, "Tweet Id is MISSING!");
    }

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Tweet Id is INVALID! (Length/Hex Pattern/format/Object Id validity)");
    }

    const tweet = await Tweets.findById(tweetId);

    if(!tweet){
        throw new ApiError(400, "Tweet DOES NOT EXIST!");
    }

    const alreadyLiked = await Like.findOne(
        {
            tweet : tweet._id,
            likedBy: user._id
        }
    )

    let like;
    let liked;
    let message = "";

    if(alreadyLiked){
        like = await Like.findByIdAndDelete(alreadyLiked._id);

        liked = false;
        message = "TWEET UNLIKED SUCCESSFULLY!"
    }
    else{
        like = await Like.create(
            {
                tweet: tweet,
                likedBy: await User.findById(user._id)
            }
        );

        if(!like){
            throw new ApiError(200, "Something went wrong while liking the tweet, please try again!")
        }

        liked = true;
        message = "TWEET LIKED SUCCESSFULLY!"
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            message,
            {
                like : like,
                liked : liked
            }
        )
    )
})

const getLikedVideos = AsyncHandler(async(req, res) => {
    const user = req.user;

    if(!user){
        throw new ApiError(400, "Invalid request! Please login!");
    }

    const userExists = await User.findById(user._id);

    if(!userExists){
        throw new ApiError("USER DOES NOT EXISTS!");
    }

    // const likedVideos = await Like.aggregate(
    //     [
    //         {
    //             $match: { 
    //                 likedBy : new mongoose.Types.ObjectId(user._id),
    //                 video : { $ne : null },
    //                 comment : null,
    //                 tweet: null
    //             }
    //         },
    //         {
    //             $lookup : {
    //                 from: "videos",
    //                 localField: "video",
    //                 foreignField: "_id",
    //                 as: "videos",
    //                 pipeline: [
    //                     {
    //                         $lookup: {
    //                             from : "users",
    //                             localField: "owner",
    //                             foreignField: "_id",
    //                             as: "owner"
    //                         }
    //                     },
    //                     {
    //                         $project : {
    //                             username: 1,
    //                             coverImage: 1,
    //                             avatar: 1,
    //                             owner: 1
    //                         }
    //                     },
    //                     {
    //                         $addFields: {
    //                             owner: {
    //                                 $first: "$owner"
    //                             }
    //                         }
    //                     }

    //                 ]
    //             }           
    //         },
    //         {
    //             $project: {
    //                 video: 1
    //             }
    //         }
    //     ]
    // )

    const likedVideos = await Like.aggregate([
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(user._id),
                video: { $ne : null },
                comment: null,
                tweet: null
            }
        }, 
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
                        }
                    }, 
                    {
                        $addFields : {
                            owner: {
                                $first: "$owner" 
                            }
                        }
                    },
                    // {
                    //     $addFields : {
                    //         ownerId: "$owner._id",
                    //         ownerUsername: "$owner.username",
                    //         ownerAvatar: "$owner.avatar"
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         title: 1,
                    //         description: 1,
                    //         thumbnail: 1,
                    //         owner_id : 1,
                    //         owner_username: 1,
                    //         owner_avatar: 1
                    //     }
                    // }
                ]
            }
        },
        {
            $addFields: {
                video: {
                    $first : "$video"
                }
            }
        },
        {
            $addFields: {
                videoId : "$video._id",
                title: "$video.title",
                description: "$video.description",
                thumbnail: "$video.thumbnail",
                ownerId : "$video.owner._id",
                ownerUsername: "$video.owner.username",
                ownerFullName: "$video.owner.fullName",
                ownerAvatar: "$video.owner.avatar"

            }
        },
        {
            $project: {
                videoId: 1,
                title: 1,
                description: 1,
                thumbnail: 1,
                ownerId: 1, 
                ownerUsername: 1,
                ownerFullName: 1,
                ownerAvatar: 1,
                likedBy: 1
            }
        }
    ])

    console.log(likedVideos);

    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            `Liked videos by ${user.username} retrived SUCCESSFULLY!`,
            likedVideos
        )
    )
})

const getLikedComments = AsyncHandler(async(req, res) => {
    const user = req.user;

    if(!user){
        throw new ApiError(300, "Invalid request | Please login!");
    }

    const userExists = await User.findById(user._id);

    if(!userExists){
        throw new ApiError(404, "USER DOES NOT EXIST!!")
    }

    const likedComments = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(user._id),
                comment: { $ne : null },
                video: null,
                tweet: null
            }
        }, 
        {
            $lookup : {
                from : "comments",
                localField: "comment",
                foreignField: "_id",
                as: "comment",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                comment: {
                    $first: "$comment"
                }
            } 
        },
        {
            $addFields: {
                commentId : "$comment._id",
                content: "$comment.content",
                ownerId: "$comment.owner._id",
                ownerUsername: "$comment.owner.username",
                ownerFullName: "$comment.owner.fullName",
                avatar: "$comment.owner.avatar"
            }
        },
        {
            $project: {
                commentId: 1,
                content: 1,
                ownerId: 1,
                ownerUsername: 1,
                ownerFullName: 1,
                avatar: 1,
                likedBy: 1
            }
        }
    ])

    if(!likedComments){
        throw new ApiError(300, "No liked comments found");
    }
    
    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            `Liked comments by ${user.username} FETCHED SUCCESSFULLY!`,
            likedComments
        )
    )
})

const getLikedTweets = AsyncHandler(async(req, res) => {
    const user = req.user;
    
    if(!user){
        throw new ApiError(400, "Invalid request | Please Login!!");
    }

    const userExists = await User.findById(user._id);

    if(!userExists){
        throw new ApiError(404, "USER DOES NOT EXISTS!!");
    }

    const likedTweets = await Like.aggregate(
        [
            {
                $match: {
                    likedBy : new mongoose.Types.ObjectId(user._id),
                    tweet: { $ne : null },
                    comment: null,
                    video: null
                }
            }, 
            {
                $lookup: {
                    from: "tweets",
                    localField: "tweet",
                    foreignField: "_id",
                    as: "tweet",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                
                            }
                        },
                        {
                            $addFields: {
                                owner: { $first : "$owner" }
                            }
                        },
                        {
                            $project: {
                                _id: 1,         // tweetId
                                content: 1,    // tweet content 
                                owner: {
                                    _id : "$owner._id",
                                    username: "$owner.username",
                                    fullName: "$owner.fullName",
                                    avatar : "$owner.avatar"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    tweet: {
                        $first: "$tweet"
                    }
                }
            }, 
            {
                $project: {
                    tweet: 1,
                    likedBy: 1
                }
            }
        ]
    )

    if(!likedTweets){
        throw new ApiError(300, `No tweets liked by ${user.username} found`);
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            `All the tweets liked by ${user.username} FETCHED SUCCCESSFULLY!`,
            likedTweets
        )
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
}