import {v2 as cloudinary} from "cloudinary";
import fs from "fs";        // fs module is used to delete the local file after uploading it to cloudinary
                            // fs refers to the file system module in Node.js which provides an API for interacting with the file system, it allows us to read, write, delete, and manipulate files and directories on the server

// import dotenv from "dotenv";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});    // this will read the cloudinary configuration from the environment variables and set it up for us to use in our application


const uploadToCloudinary = async function(localFilePath){
    try{
        if(!fs.existsSync(localFilePath)){
            console.log("File does not exist in the local file system at " + localFilePath);   // this will log the error to the console, you can remove this line in production
            return null;    // this will return null if the file does not exist in the local file system, we will handle this case in our video controller and send an appropriate response to the client
        }

        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"});
        fs.unlinkSync(localFilePath);   // this will delete the local file after uploading it to cloudinary, we use unlinkSync because it is a synchronous method and it will block the event loop until the file is deleted, which is fine in this case because we want to make sure that the file is deleted (FOR SURE) before we return the result to the client
        console.log("File uploaded to Cloudinary successfully" + response.secure_url);   // this will log the secure URL of the uploaded file to the console, you can remove this line in production
        return response;    // this will return the result of the upload operation which contains the secure URL of the uploaded file and other information about the uploaded file, we will use this secure URL to store it in our database and send it to the client
    }
    catch(error){
        fs.unlinkSync(localFilePath);   // Remove the locally saved temporary file since the upload operation got FAILED!
        console.log("Errpr occured while uploading file to Cloudinary" + error);   // this will log the error to the console, you can remove this line in production
        return err   // this will throw the error to the caller function which is the video controller in our case, and we will handle this error in our error handling middleware and send an appropriate response to the client
    }
}

export {uploadToCloudinary}; 