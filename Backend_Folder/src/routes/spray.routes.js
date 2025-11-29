import { Router } from "express";
import { addSprayEvent, getMySprays, getMyRewards } from "../controllers/spray.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/add", verifyJWT, addSprayEvent);
router.get("/my", verifyJWT, getMySprays);
router.get("/rewards", verifyJWT, getMyRewards);

export default router;
