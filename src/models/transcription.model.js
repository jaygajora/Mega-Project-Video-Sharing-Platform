import mongoose from "mongoose"

const transcriptionSchema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        originalLanguage: {
            type: String,
            default: null
        },
        targetLanguage: {
            type: String,
            // required: true
            default: null   // default value is English, you can change it to any language you want
        },
        extractedAudioPath: {
            type: String,    // cloudinary URL for the extracted audio file
            default: null
        },
        transcript: {
            type: String,
            default: null
        },
        translatedTranscript: {
            type: String,
            default: null
        },
        translatedAudioPath: {
            type: String,    // cloudinary URL for the translated audio file
            default: null
        },
        status: {
            type: String,
            enum: [ 
                "QUEUED", 
                "PROCESSING", 
                "AUDIO_EXTRACTED", 
                "TRANSCRIBED", 
                "CONVERTED_TRANSCRIPTION_TO_TARGET_LANGUAGE",  
                "AUDIO_GENERATED", 
                "COMPLETED", 
                "FAILED"
            ],
            default: "QUEUED"
        },
        error: {
            type: String,
            default: null
        },
        jobId: {
            type: String,
        }
    },  
    {
        timestamps: true
    }
);

export const Transcriptions = mongoose.model("Transcription", transcriptionSchema);
