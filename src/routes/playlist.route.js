import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    getUserPlaylist
} from "../controllers/playlist.controller.js"

const router = Router();

router.route("/").post(createPlaylist);

router.route("/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/:playlistId").patch(verifyJWT, updatePlaylist);
router.route("/:playlistId").delete(verifyJWT, deletePlaylist);

router.route("/add/:videoId/:playlistId").post(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").post(verifyJWT, removeVideoFromPlaylist);

router.route("/user/:userId").get(verifyJWT, getUserPlaylist);

export default router;