import mongoose, {Schema} from "mongoose";

const tweetSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        reqired: true,
        trim: true,
        index: true
    }
}, {timestamps : true});

export const Tweets = mongoose.model("Tweet", tweetSchema);