import { Router } from "express";
import { spawn } from "child_process";
import { analyzePlantDisease } from "../Services/ai.service.js";

const router = Router();

router.get("/capture", async (req, res) => {
    try {
        const python = spawn("python", ["camera_capture.py"], { cwd: "src/Services" });

        python.stdout.on("data", async (data) => {
            const imagePath = data.toString().trim();
            console.log("Captured Image Path:", imagePath);

            const localImageUrl = `http://localhost:8000/${imagePath}`;

            const response = await analyzePlantDisease(localImageUrl);

            return res.json({
                success: true,
                image: imagePath,
                analysis: response
            });
        });

        python.stderr.on("data", (data) => {
            console.error("Python Error:", data.toString());
        });

    } catch (err) {
        res.status(500).json({ error: "Camera capture failed", details: err.message });
    }
});

export default router;
