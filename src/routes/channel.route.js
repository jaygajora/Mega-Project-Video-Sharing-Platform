import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelVideos, getCommentsByUser } from "../controllers/channel.controller.js"
import { getUserTweets } from "../controllers/tweet.controller.js";
import { getUserPlaylist } from "../controllers/playlist.controller.js";
const router = Router();

router.use(verifyJWT);


// router.route("/:username").get();     // getChannelDetails
router.route("/:username/videos").get(getChannelVideos);    //verifyJWT for all the endpoints is in place already
router.route("/:username/playlists").get(getUserPlaylist);
// router.route("/:username/dashboard").get();    // only stats because we are giving the videos in /:username/vidoes
router.route("/:username/tweets").get(getUserTweets)    //optional
router.route("/:username/comments").get(getCommentsByUser);



export default router;