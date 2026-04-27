import fs from "fs";
import path from "path";


async function downloadFileFromCloudinary(cloudinaryURL, outputFolderPath = "uploads/downloadedVideos"){
    try{
        if(!cloudinaryURL){
            throw new Error("Cloudinary URL is required to download the file!");
        }

        const outputPath = path.resolve(outputFolderPath);
        
        if(!fs.existsSync(outputPath)){
            fs.mkdirSync(outputPath, { recursive: true });
        }

        const fileName = `${Date.now()}_downloaded_video.mp4`;
        const filePath = path.join(outputPath, fileName);

        const video = await fetch(cloudinaryURL);

        if(!video.ok){
            throw new Error("Failed to download the file from Cloudinary!"  + video.resolve + " " + video.statusText);
        }

        const arrayBuffer = await video.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync(filePath, buffer);

        console.log("File downloaded successfully from Cloudinary at: " + filePath);
        return filePath;
    }
    catch(error){
        console.error("Error while downloading file from Cloudinary: ", error);
        throw error;
    }
}

export { downloadFileFromCloudinary };