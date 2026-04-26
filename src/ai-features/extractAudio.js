import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";

const ffprobePath = ffmpegPath.path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function extractAudioFromVideo(videoFilePath){ 
    // we will use ffmpeg to extract audio from video
    // we will use fluent-ffmpeg library to do this 
    return new Promise((resolve, reject) => {
        
        // const outputFolderPath = path.resolve("uploads/audio", outputFolderPath || `${Date.now()}_audio.mp3`);

        const folderPath = path.resolve("uploads/extracted-audio");
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const fileName = `${Date.now()}_extracted-audio.mp3`;
        const outputFilePath = path.join(folderPath, fileName);

        ffmpeg(videoFilePath)
        .noVideo()
        .audioCodec("libmp3lame")
        .on("end", () => { resolve(outputFilePath) })
        .on("error", (error) => { reject(error) })
        .save(outputFilePath);
    });
}

export { extractAudioFromVideo };
