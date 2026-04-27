import { openai } from "../../configs/openai.config.js";
import { Readable } from "stream";
import { ApiError } from "../../utils/ApiError.js";
import path from "path";
import fs from "fs";

async function generateAudioFromText(text, language, outputfolderPath = "uploads/generatedAudio"){

    try {
        // Ensure the output folder exists, if not create it
        const folderPath = path.resolve(outputfolderPath);
        
        // Check if the folder exists, if not create it
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Generate a unique file name for the audio file
        const fileName = `${Date.now()}_${language || "default"}.mp3`;
        
        // Create the full file path for the generated audio file
        const filePath = path.join(folderPath, fileName);

        // Generate audio from text using OpenAI's TTS model
        const audio = await openai.audio.speech.create({
            model: "tts-1",
            input: text,
            voice: "alloy"
        });
        

        // const audioUrl = audio.data.url;
        // console.log(audio);

        // Fetch the audio data from the URL and convert it to a buffer
        const buffer = Buffer.from(await audio.arrayBuffer());

        // Save the audio file to the specified path
        fs.writeFileSync(filePath, buffer);
        console.log("Audio file generated successfully at: " + filePath);
        return filePath;  
    }
    catch (error) {
        console.error("Error while generating audio from text: ", error);
        throw new ApiError(500, "Failed to generate audio from text");
    }
}

export { generateAudioFromText };