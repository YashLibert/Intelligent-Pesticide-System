import { Router } from "express";
import { analyzePlantDisease } from "../Services/ai.service.js";


const router = Router();

router.route("/ai").post(analyzePlantDisease);

export default router;