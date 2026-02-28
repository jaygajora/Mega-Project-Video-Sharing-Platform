import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Tweets } from "../models/tweet.model.js";
import mongoose from "mongoose"

const createTweet = AsyncHandler(async(req, res) => {
    const { username } = req.user;
    const { content } = req.body;

    if(!username){
        throw new ApiError(400, "Invalid request for posting a tweet! Please Login");
    }

    const user = await User.findById(req.user._id);

    if(!user){
        throw new ApiError(300, "No such found");
    }

    if(!content){
        throw new ApiError(300, "No content found for the tweet!");
    }

    if(content.trim() == ""){
        throw new ApiError(300, "Please add content for the tweet!");
    }

    const tweet = await Tweets.create({
        content: content.trim(),
        owner: user
    })

    if(!tweet){
        throw new ApiError(400, "Something went wronf while creating a Tweet in the Database, please try again!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Tweet created successfully!",
            tweet
        )
    )
})

const getUserTweets = AsyncHandler(async(req, res) => {
    const { username } = req.params;

    if(!username || username == undefined || username.trim() == ""){
        throw new ApiError(300, "Please mention the username to extract tweets of a particular user")
    }

    const user = await User.findOne({ username : username.toLowerCase() });

    if(!user){
        throw new ApiError(300, "No such user found in records!");
    }

    const tweets = await Tweets.find({ owner : user._id });   // this will return an array

    if(!tweets){
        throw new ApiError(300, "User has not posted any tweets yet!");
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            `Tweets for username ${user.username} fetch successfully!`,
            tweets
        )
    )
})

const updateTweet = AsyncHandler(async(req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if(!tweetId){
        throw new ApiError(300, "Enter a tweetId");
    }

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(300, "Invalid tweetId (length/hex pattern/format/objectId validity)")
    }

    const tweet = await Tweets.findById(tweetId);

    if(!tweet){
        throw new ApiError(400, "No such tweet found | Invalid tweetId");
    }

    if(!content){
        throw new ApiError(300, "No content found!");
    }

    if(content.trim() == ""){
        throw new ApiError(300, "Enter content for the tweet")
    }

    const updatedTweet = await Tweets.findByIdAndUpdate(
        tweetId,
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
            "Tweet updated SUCCESSFULLY!",
            updatedTweet
        )
    )
})

const deleteTweet = AsyncHandler(async(req, res) => {
    const { tweetId } = req.params;

    if(!tweetId){
        throw new ApiError(404, "TweetId is Empty");
    }

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(300, "Invalid TweetId (Length/hex pattern/format/Object validity!)")
    }

    const tweet = await Tweets.findById(tweetId);

    if(!tweet){
        throw new ApiError(404, "No such tweet found");
    }

    await Tweets.findByIdAndDelete(tweetId);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Tweet deleted SUCCESFULLY!",
            {
                deletedTweet : tweet
            }
        )
    )
})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}