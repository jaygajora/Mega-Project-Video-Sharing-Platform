import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";

const ffprobePath = ffmpegPath.path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function extractAudioFromVideo(videoFilePath, outputFileName){ 
    // we will use ffmpeg to extract audio from video
    // we will use fluent-ffmpeg library to do this 
    return new Promise((resolve, reject) => {
        const outputFilePath = path.resolve("uploads/audio", outputFileName || `${Date.now()}_audio.mp3`);

        ffmpeg(videoFilePath)
        .noVideo()
        .audioCodec("libmp3lame")
        .on("end", () => { resolve(outputFilePath) })
        .on("error", (error) => { reject(error) })
        .save(outputFilePath);
    });
}

export { extractAudioFromVideo };
