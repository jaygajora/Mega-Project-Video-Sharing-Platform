import { openai } from "../../configs/openai.config.js";

import LanguageDetect from "languagedetect";
const langageDetector = new LanguageDetect();

async function detectOriginalLanguage(originalTranscript){

    const detectedLanguage = langageDetector.detect(originalTranscript, 1);
    console.log("Detected Language: " + detectedLanguage[0][0] + " confindence score: " + detectedLanguage[0][1]);
    return detectedLanguage[0][0]; 
}

export { detectOriginalLanguage };