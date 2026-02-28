import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { 
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo 
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/").get(async(req, res) => {
    res.send("Welcome to the Videos page")
});

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

router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(
    upload.single("thumbnail"),
    updateVideo);

router.route("/:videoId").delete(deleteVideo);


export default router;