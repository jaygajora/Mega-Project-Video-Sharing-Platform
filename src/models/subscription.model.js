import mongoose, {Schema} from "mongoose";


const subscriptionSchema = new mongoose.Schema({
    channel: {                                     // one to whom the users are subscribing
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subscribers: [{                              // the people who have subscribed to a particular channel
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {timestamps : true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);