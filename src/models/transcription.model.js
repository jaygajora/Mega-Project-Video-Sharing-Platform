import mongoose from "mongoose"

const transcriptionSchema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        audio: {
            type: String,    // cloudinary URL for the extracted audio file
            required: true
        },
        transcript: {
            type: String,
            default: null
        },
        originalLanguage: {
            type: String,
            default: null
        },
        // newLanguage: {
        //     type: String,
        //     // required: true
        //     default: "English"   // default value is English, you can change it to any language you want
        // },
        translatedTranscript: {
            type: String,
            default: null
        },
        translatedAudio: {
            type: String,    // cloudinary URL for the translated audio file
            default: null
        }
    },  
    {
        timestamps: true
    }
);

export const Transcriptions = mongoose.model("Transcription", transcriptionSchema);
