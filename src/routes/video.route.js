import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { 
    // getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus 
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.use(verifyJWT); 

router.route("/").get(async(req, res) => {
    res.send("Welcome to the Videos page")
});

// router.route("/").get(verifyJWT, getAllVideos);


router.route("/").post(
    verifyJWT,
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]
    ),
    publishAVideo);

router.route("/:videoId").get(verifyJWT, getVideoById);
router.route("/:videoId").patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo);

router.route("/:videoId").delete(verifyJWT, deleteVideo);

router.route("/:videoId/toggle-publish-status").post(verifyJWT, togglePublishStatus);

export default router;