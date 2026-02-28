import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const generateAccessAndRefreshTokens =  async (user) => {
    try{

        // console.log("Inside generateAccessAndRefreshTokens");
        // const user = await User.findById(userId)
        // console.log("User form generate access and refresh Token method" + user);
        const accessToken =  user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log("From generateAccessAndRefreshTokens() : New Access Token = " + accessToken + " & New RefeshToken = " + refreshToken);

        // console.log()


        user.refreshToken = refreshToken;                 // changing the value in DB
        await user.save({validateBeforeSave : false});    // saving into the DB, while mentioning that we dont need validation atm as we have already validated the username/email and password because save() by default requires validation

        return {accessToken, refreshToken};
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
    }
}

const registerUser = AsyncHandler(async(req, res) => {
    // take data from frontend
    // validate the data
    // check if the user already exisits in the database
    // check if we have avatar in the request ->upload it to cloudinary -> get the url of the uploaded image
    // check cover photo is there in the request -> upload it to cloudinary -> get the url of the uploaded image
    // create a new User object and save it to the database
    // Remove the password and refreshToken from the response object before sending it back to the client for security reasons
    // check for user response
    // send a response back to the client with the details of the created user (-password - refreshToken)

    const {fullName, username, email, password} = req.body;

    console.log("Request body: ", req.body);   // this will log the request body to the console, you can remove this line in production

    // console.log("Email: " + email);

    console.log("Files in the request: ", req.files);  

    if(
        [fullName, username, email, password].some((field) => {
            return !field || field.trim() === "";
        }
    )){
        console.log("All fields are required!!");   // this will log the error to the console, you can remove this line in production
        throw new ApiError(400, "All fields are required!! Please fill all the fields and try again.");   // this will throw an error with a status code of 400 (Bad Request) and a message indicating that all fields are required, we will handle this error in our error handling middleware and send an appropriate response back to the client
    }

    const userExists = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(userExists){
        throw new ApiError(409, "User with the same email or username already exists!!");
    }

    // let avatar, coverImage;

    let avatarLocalPath;        // its default value will be undefined
    let coverImageLocalPath;   // its default value will be undefined

    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files.avatar[0].path;
    }

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required!! Please upload an avatar image and try again.");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);  

    console.log("Avatar upload response: ", avatar);   // this will log the response from cloudinary for the avatar upload to the console, you can remove this line in production
    console.log("Cover image upload response: ", coverImage);   // this will log the response from cloudinary for the cover image upload to the console, you can remove this line in production
    
    if(!avatar){
        throw new ApiError(400, "Error uploading avatar image!! Please try again.");
    }



    // console.log("Files in the request: ", req.files);   // this will log the files in the request to the console, you can remove this line in production

    const user = await User.create({
        fullName,
        username : username.toLowerCase(), 
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Error creating user!! Please try again.");   // this will throw an error with a status code of 500 (Internal Server Error) and a message indicating that there was an error creating the user, we will handle this error in our error handling middleware and send an appropriate response back to the client
    }

    // createdUser.select("-password -refreshToken");   // this will remove the password and refreshToken fields from the createdUser object, we don't want to send these fields back to the client for security reasons

    console.log("User created in DB " + createdUser);


    res.status(200).json(
        new ApiResponse(201, "User registered successfully!!", createdUser)
    )   // this will send a response back to the client with a status code of 201 (Created) and a message indicating that the user was registered successfully, along with the details of the created user (except password and refreshToken);


})

const loginUser = AsyncHandler(async (req, res) => {

    // enter username ans password
    // check if username and password are not empty
    // check is any user with such username exists
    // if any such user exists then check if the password is correct
    // GENERATE ACCESS and REFRESH TOKENS
    //SEND COOKIES
    // if both username and password is correct then MAKE THE USER LOGGED IN!! 


    const {username, email, password} = req.body;
    
    // console.log("Reqest Body: " + req.body);

    if(!username && !email){
        throw new ApiError(400, "Username or Email Id is required!");
    }

    if(!password){
        throw new ApiError(400, "Password is required!");
    }

    const foundUser = await User.findOne({
        $or: [{email}, {username}]     // but what if the user has send emailId and username that are there in the Db but are registered for different users?
    });

    // console.log("Found User: " + foundUser);

    if(!foundUser){
        throw new ApiError(400, "No such user found!");
    }

    // const passwordInDB = await User.findOne({password: foundUser.password});

    // const passwordInDB = foundUser.password;    // the isPasswordCorrect() will have access to it with the help of 'this' keyword 

    // console.log("Password in DB: " + passwordInDB);

    // foundUser.password = "";   // so that it is not revealed while testing API from POSTMAN

    const correctPassword = await foundUser.isPasswordCorrect(password);   // from '../models/user.model.js'


    // const passwordIsCorrect = await bcrypt.compare(password, passwordInDB);

    if(!correctPassword){ 
        throw new ApiError(401, "Passowrd is incorrect. Please try again!");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(foundUser);

    foundUser.password = "";   // so that it is not revealed while testing API from POSTMAN
    foundUser.refreshToken = "";

    const options = {
        httpOnly: true,
        secure: true       // options for cookies so that refresh tokens and access tokens can only be modified from the backend and NOT from the frontend!!
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            201,
            "User Logged in Successfully",
            {user: foundUser, accessToken, refreshToken}
        )
    )

    // res.status(200).json(
    //     new ApiResponse(201, "User LoggedIn", foundUser)
    // )
})

const logoutUser = AsyncHandler(async (req, res) =>{

    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: { refreshToken: null }   // OR $unset: { refreshToken: 1 } removes the field from document
            },
            {
                new: true
            }
        )
    
        const options = {
            httpOnly : true,
            secure : true 
        }
    
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200, 
                "User Logged Out Successfully",
                user
            )
        )
    } catch (error) {
        throw new ApiError(400, "Unable to logout, please try again!" + error)
    }
    
})

const refreshAccessToken = AsyncHandler(async (req, res) => {

    if(!req.cookies.refreshToken && !req.body.refreshToken){
        throw new ApiError(401, "Unauthorized Request | User is NOT Logged In!");
    }

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // if(!incomingRefreshToken){
    //     throw new ApiError(401, "Unauthorized request | No refreshTokens found in cookies");
    // }

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        if(!decodedRefreshToken){
            return new ApiError(400, "Invalid Refresh Token!");
        }
    
        const user = await User.findById(decodedRefreshToken._id);
    
        if(!user){
            throw new ApiError(400, "No such user found while refreshing the access tokens")
        }
    
        // console.log("User: " + user);
    
        const refreshTokenInDB = user.refreshToken;
    
        if(!refreshTokenInDB){
            throw new ApiError(400, "Refresh Tokens not found in DB");
        }
    
        if(!(incomingRefreshToken === refreshTokenInDB)){
            throw new ApiError(400, "Refresh Token in the request and the on in the DB do not match!");
        }
    
        //AWAIT BECAUSE IT IS GOING TO INTERACT WITH DB
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user);    // keep the names of the properties same while destructing an object
    
        // console.log("New Access Token = " + accessToken + " & New RefeshToken = " + refreshToken);
        
        if(!accessToken || !refreshToken){
            throw new ApiError(400, "Error occured while generating new tokens");
        }
    
        await User.findByIdAndUpdate(
            user._id,
            {
                $set : {
                    refreshToken : refreshToken
                }
            },
            {
                new: true
            }
        )
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        res.
        status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                "Access Token and Refesh Token have been REFRESHED!",
                {user: {user, tokens : {accessToken, refreshToken}}}
            )
        )
    } catch (error) {
        throw new ApiError(400, "Something went wrong while refreshing the tokens")
    }

})

const updatePassword = AsyncHandler(async (req, res) => {


    const {currentPassword, newPassword, confirmNewPassword } = req.body;

    if(!currentPassword){
        throw new ApiError(400, "Current Password is required!");
    }

    if(!newPassword){
        throw new ApiError(400, "New Password is required!");
    }

    if(!confirmNewPassword){
        throw new ApiError(400, "Confirm New Password is required!");
    }

    // const user = req.user;      // because req.user might not have .password if sent via "-password"
    const user = await User.findById(req.user._id).select("-refreshToken");

    const correctPassword = await user.isPasswordCorrect(currentPassword);

    if(!correctPassword){
        throw new ApiError(401, "Current Password is INCORRECT");
    }

    if(newPassword !== confirmNewPassword){
        throw new ApiError(400, "New Passwords do not match");
    }

    if(currentPassword === newPassword){
        throw new ApiError(400, "New password cannot be same as the Current password");
    }

    // await User.findByIdAndUpdate(
    //     user._id,
    //     {$set: {
    //             password: await bcrypt.hash(newPassword, 10)
    //         }
    //     },
    //     {
    //         new : true
    //     }
    // )

    // user.password = await bcrypt.hash(newPassword, 10);  // the password will be hashed twice (once here and once in the pre save() middleware which will cause an error while authenticating.)    
    user.password = newPassword;    // it will be hashed via pre.save()
    await user.save({validateBeforeSave : false});
    
    console.log("New Password:" + user.password);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Password Updated Successfully!",
            {}
        )
    )
})

const updateUserDetails = AsyncHandler(async(req, res) => {

    // to update username, full name and email

    // we will directly update the fullname
    // but for username and email, we will check any such user already exists in the DB
    // if no such user existsthen the user can update their username/email, ELSE WE WILL THROW AN ERROR

    const { username, email, fullName } = req.body;

    let usernameAlreadyExists = null;
    let emailAlreadyExists = null;

    if(username){
        usernameAlreadyExists = await User.findOne({username: username});
    }

    if(email){
        emailAlreadyExists = await User.findOne({email: email});
    }

    if(usernameAlreadyExists){
        throw new ApiError(400, `Username ${username} is not available | User already exists`);
    }

    if(emailAlreadyExists){
        throw new ApiError(400, `Email ${email} is not available | User already exists`);
    }

    const user = req.user;
    
    if(username){
        user.username = username;
    }

    if(email){
        // verify current email via otp  - MIDDLEWARE
        // verify new email via otp      - MIDDLEWARE
        user.email = email;
    }

    if(fullName){
        user.fullName = fullName;
    }

    await user.save({validateBeforeSave : true});

    res
    .status(200)
    .json(
        new ApiResponse(
            201,
            "User Details Updated Successfully!",
            await User.findById(req.user._id).select("-password -refreshToken")
        )
    )
})

const updateAvatar = AsyncHandler(async(req, res) => {
    
    if(!req.file){
        throw new ApiError(400, "Avatar file is missing!");
    }

    console.log("Uploaded new Avatar:")
    console.log(req.file);

    const avatarLocalPath = req.file.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Local Path for Avatar file is MISSING!");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500, "Something went wrong while uploading the file to Cloudinary.");
    }
    
    const user = req.user;

    const oldAvatar = user.avatar;

    user.avatar = avatar.url;
    await user.save({validateBeforeSave : false});

    return res
    .status(200)
    .json(
        new ApiResponse(
            201,
            "Avatar updated successfully!",
            {
                "Old Avatar: " : oldAvatar,
                "New Avatar: " : user.avatar
            }
        )
    )
})

const updateCoverImage = AsyncHandler(async(req, res) => {
    
    if(!req.file){
        throw new ApiError(400, "No File found, please re-upload your Cover Image");
    }

    const coverImageLocalPath = req.file.path;

    if(!coverImageLocalPath){
        throw new ApiError(401, "Local Path for CoverImage not Found");
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!coverImage){
        throw new ApiError(500, "Something went wrong while uploading file to Cloudinary");
    }

    const user = req.user;
    
    const oldCoverImage = user.coverImage;

    user.coverImage = coverImage.url;    // updating coverImage with the new one

    await user.save({validateBeforeSave : false});

    res
    .status(200)
    .json(
        new ApiResponse(
            201,
            "Cover Image Updated Successfully!",
            {
                "oldCoverImage" : oldCoverImage,
                "newCoverImage" : user.coverImage 
            }
        )
    )
})

const getProfileDetails = AsyncHandler(async(req, res) => {
    const user = req.user;

    res
    .status(200)
    .json(
        new ApiResponse(
            201,
            "User details fetch successfully",
            user
        )
    )
})

// const getUserProfileDetails = AsyncHandler(async(req, res) => {
//     const {username} = req.params;

//     if(!username?.trim()){
//         throw new ApiError(400, "No username found");
//     }

//     // const user = await User.find({username : username});

//     const channel = await User.aggregate([
//         {
//             $match : {username : username?.toLowerCase()}
//         }, 
//         {
//             $lookup : {
//                 from: "subscriptions",
//                 localField: "_id",
//                 foreignField: "channel",
//                 as : "subscribers"
//             } 
//         }, 
//         {
//             $lookup: {
//                 from: "subscriptions",
//                 localField: "_id",
//                 foreignField: "subscriber",
//                 as: "subscribedTo"  
//             }
//         }, 
//         {
//             $addFields : {
//                 subscribersCount : {
//                     $size : "$subscribers"
//                 },
//                 subscribedToCount : {
//                     $size : "$subscribedTo"
//                 },
//                 hasSubscribed : {
//                     $cond : {
//                         if : {
//                             $in: [req.user?._id, "$subscribers.subscriber"]
//                         },
//                         then : true,
//                         else : false
//                     }
//                 }
//             }
//         },
//         {
//             $project: {
//                 fullName: 1,
//                 username: 1,
//                 email: 1,
//                 avatar: 1,
//                 coverImage: 1,
//                 subscribersCount: 1,
//                 subscribedToCount: 1,
//                 hasSubscribed: 1
//             }
//         }
//     ]);

//     if(!channel){
//         throw new ApiError(400, "Something went wrong in the pipeline");
//     }

//     if(channel.length == 0){
//         throw new ApiError(400, "Channel NOT FOUND");
//     }

//     console.log(channel);

//     res
//     .status(200)
//     .json(
//         new ApiResponse(
//             201,
//             "Channel Details fetched SUCCESSFULLY!",
//             {
//                 channel : channel[0]
//             }
//         )
//     )
// })

const getWatchHistory = AsyncHandler(async(req, res) => {

    if(!req.user){
        throw new ApiError(401, "No user found | User NOT LoggedIn")
    }

    const user = await User.aggregate([
        {
            $match : {_id : new mongoose.Types.ObjectId(req.user._id)}
        }, 
        {
            $lookup: {
                from : "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline : [
                    {
                        $lookup : {                   // subpipeline
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline : [
                                {
                                    $project: {
                                        username : 1,
                                        fullName: 1,
                                        avatar: 1,  
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner : { $first : "$owner" }
                        }
                    }
                ]
            }
        }
    ])

    if(user.length == 0){
        throw new ApiError(400, "User NOT FOUND | Something went wrong while creating the watchHistory pipeline")
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Watch history fetched successfully",
            user[0].watchHistory
        )
    )
})

const forceResetPassword = AsyncHandler(async(req, res) =>{
    
    const user = req.user;
    user.password = "temp";
    user.save({validationBeforeSave : false});
    
    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "Password forcefully reset to 'temp'",
            {}
        )
    )
})

export {
    loginUser, 
    registerUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    forceResetPassword,
    updateUserDetails, 
    updateAvatar,
    updateCoverImage,
    getProfileDetails,
    // getUserProfileDetails,
    getWatchHistory
}; 

