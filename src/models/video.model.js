import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String,    // cloudinary URL for the uploaded video file
        required: true
    },
    thumbnail: {
        type: String,    // cloudinary URL for thumbnail image
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,   // video belongs to ONLY ONE user hence it is not an array
        ref: "User"
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    }, 
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);   // this will add the aggregatePaginate method to the videoSchema which we can use in our video controller to paginate the videos when we fetch them from the database

export const Video = mongoose.model("Video", videoSchema);



