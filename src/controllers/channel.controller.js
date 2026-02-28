import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model.js";

const getChannelDetails = AsyncHandler(async(req, res) => {
    const { username } = req.params;

    if(!username?.trim()){
        throw new ApiError(400, "No username found");
    }

    const user = await User.find({username : username});

    if(!user){
        throw new ApiError(400, "No user channel found!");
    }

    const channel = await User.aggregate([
        {
            $match : {username : username?.toLowerCase()}
        }, 
        {
            $lookup : {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as : "subscribers"
            } 
        }, 
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"  
            }
        }, 
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                subscribedToCount : {
                    $size : "$subscribedTo"
                },
                hasSubscribed : {
                    $cond : {
                        if : {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                description: 1,
                // email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                hasSubscribed: 1     // if(username is == req.user.username, dont display the subscribed button)
            }
        }
    ]);

    if(!channel){
        throw new ApiError(400, "Something went wrong in the pipeline");
    }

    if(channel.length == 0){
        throw new ApiError(400, "Channel NOT FOUND");
    }

    console.log(channel);

    res
    .status(200)
    .json(
        new ApiResponse(
            201,
            "Channel Details fetched SUCCESSFULLY!",
            {
                channel : channel[0]
            }
        )
    )
})


export {
    getChannelDetails
}