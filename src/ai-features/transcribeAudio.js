import fs from "fs";

//********************************* */
import { openai } from "../configs/openai.config.js";

async function transcribeAudioToText(audioFilePath){
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: "whisper-1",
        response_format: "text",
    })

    return transcription;
}

export { transcribeAudioToText };