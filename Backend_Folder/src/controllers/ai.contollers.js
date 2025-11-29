import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { analyzePlantDisease } from "../Services/ai.service.js";

const pythonPath = "C:/Users/icon/Desktop/Hackathon Project/Backend/src/Services/.venv/Scripts/python.exe";
const AIServiceDir = "C:/Users/icon/Desktop/Hackathon Project/Backend/src/Services";

export const cameraScan = async (req, res) => {
    try {
        const python = spawn(pythonPath, ["camera_capture.py"], { cwd: AIServiceDir });

        let imagePath = "";

        python.stdout.on("data", (data) => {
            const output = data.toString().trim();
            // Read only valid file paths
            if (output.endsWith(".jpg")) {
                imagePath = output;
            }
        });

        python.stderr.on("data", (data) => {
            console.error("Python Error:", data.toString());
        });

        python.on("close", async () => {
            if (!imagePath) {
                return res.status(500).json({ error: "No image captured" });
            }

            // analyze using Hugging Face model
            const analysis = await analyzePlantDisease(`file:///${imagePath}`);

            res.json({
                success: true,
                capturedImage: imagePath,
                analysis,
            });
        });

    } catch (err) {
        console.error("Camera Scan Error:", err);
        res.status(500).json({ error: err.message });
    }
};
