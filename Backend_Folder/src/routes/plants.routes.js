import { Router } from "express";
import { detectAndLogDisease } from "../controllers/plants.controllers.js";
import { addPlant } from "../controllers/plants.controllers.js";

const router = Router();

router.post("/detect", detectAndLogDisease);
router.post("/add", addPlant);
export default router;
