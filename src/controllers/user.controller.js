import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";

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
    // if both username and password is correct then MAKE THE USER LOGGED IN!! 


    const {email, password} = req.body;
    
    console.log("Reqest Body: " + req.body);

    if(!email){
        throw new ApiError(400, "Email Id is required!");
    }

    if(!password){
        throw new ApiError(400, "Password is required!");
    }

    const foundUser = await User.findOne({email: email});

    console.log("Found User: " + foundUser);

    if(!foundUser){
        throw new ApiError(400, "Incorrect email Id, no such user found!");
    }

    // const passwordInDB = await User.findOne({password: foundUser.password});

    const passwordInDB = foundUser.password;

    console.log("Password in DB: " + passwordInDB);

    foundUser.password = "";   // so that it is not revealed while testing API from POSTMAN

    const passwordIsCorrect = await bcrypt.compare(password, passwordInDB);

    if(!passwordIsCorrect){ 
        throw new ApiError(401, "Passowrd is incorrect. Please try again!");
    }

    res.status(200).json(
        new ApiResponse(201, "User LoggedIn", foundUser)
    )
})

export {loginUser, registerUser}; 

