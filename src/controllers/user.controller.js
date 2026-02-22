import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverPhoto[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required!! Please upload an avatar image and try again.");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Error uploading avatar image!! Please try again.");
    }



    // console.log("Files in the request: ", req.files);   // this will log the files in the request to the console, you can remove this line in production

    const user = await User.create({
        fullname,
        username : username.toLowerCase(), 
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await user.findById(user._id);

    if(!createdUser){
        throw new ApiError(500, "Error creating user!! Please try again.");   // this will throw an error with a status code of 500 (Internal Server Error) and a message indicating that there was an error creating the user, we will handle this error in our error handling middleware and send an appropriate response back to the client
    }

    createdUser.select("-password -refreshToken");   // this will remove the password and refreshToken fields from the createdUser object, we don't want to send these fields back to the client for security reasons

    console.log("User created in DB " + createdUser);


    res.status(200).json(
        new ApiResponse(201, "User registered successfully!!", createdUser)
    )   // this will send a response back to the client with a status code of 201 (Created) and a message indicating that the user was registered successfully, along with the details of the created user (except password and refreshToken);


})

export {registerUser}; 

