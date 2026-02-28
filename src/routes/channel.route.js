import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/:username").get();     // getChannelDetails
router.route("/:username/videos").get();
router.route("/:username/playlist").get();
router.route("/:username/dashboard").get();    // only stats because we are giving the videos in /:username/vidoes
router.route("/tweets").get()    //optional