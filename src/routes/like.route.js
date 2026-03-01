import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
} from "../controllers/like.controller.js"


const router = Router();


router.route("/toggle/v/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/toggle/c/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/toggle/t/:tweetId").post(verifyJWT, toggleTweetLike);

router.route("/videos").get(verifyJWT, getLikedVideos);
router.route("/comments").get(verifyJWT, getLikedComments);
router.route("/tweets").get(verifyJWT, getLikedTweets);


export default router;