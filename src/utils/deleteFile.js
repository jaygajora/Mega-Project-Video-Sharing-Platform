import fs from "fs";
import { ApiError } from "./ApiError.js";

async function deleteLocalFile(filePath){
try{
        if(!filePath){
            throw new ApiError(400, "Invalid file path");
        }
        
        if(filePath && fs.existsSync(filePath)){
            fs.unlinkSync(filePath);    // delete the local file after uploading it to cloudinary
        }

    }
    catch(error){
        console.log("Error while deleting local files: " + error);
        throw new ApiError(500, "Something went wrong while deleting the local files!")
    }
}

export { deleteLocalFile };