import { Router } from "express";
import { getUserLeetCodeProfile } from "../controllers/leetcode.controller.js";

const router = Router();

router.route("/:username").get(getUserLeetCodeProfile);

export default router;

