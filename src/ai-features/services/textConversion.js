import { openai } from "../../configs/openai.config.js";

async function convertText(originalTranscriptText, originalLanguage, newLanguage){
    if(originalLanguage === newLanguage){
        return originalTranscriptText;    // text is already in english
    }

    const prompt = `You are a translation expert. Translate the following text from ${originalLanguage} to ${newLanguage} qith maximum accuracy: ${originalTranscriptText}. 
    \n Only provide the translated text without any additional information or explanations.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-5.5",
            messages: [
                {
                    role: "system",
                    content: `You are a translation expert. Translate the given text from ${originalLanguage} to ${newLanguage} with maximum accuracy.`
                },
                {
                    role: "user",
                    content: `Translate the following text to ${newLanguage}: ${originalTranscriptText}.`
                }
            ]
        });

        const translatedText = response.choices[0].message.content;

        console.log("Translated Text: " + translatedText);
        return translatedText;
    }
    catch (error) {
        console.error("Error while translating text: ", error);
        throw new ApiError(500, "Failed to translate text");
    }
}

export { convertText };