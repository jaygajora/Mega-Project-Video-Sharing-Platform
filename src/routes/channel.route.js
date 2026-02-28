import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelVideos } from "../controllers/channel.controller.js"
import { getUserTweets } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

console.log("inside channel router");
// router.route("/:username").get();     // getChannelDetails
router.route("/:username/videos").get(getChannelVideos);    //verifyJWT for all the endpoints is in place already
// router.route("/:username/playlist").get();
// router.route("/:username/dashboard").get();    // only stats because we are giving the videos in /:username/vidoes
router.route("/:username/tweets").get(getUserTweets)    //optional



export default router;