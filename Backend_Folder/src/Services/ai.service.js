import 'dotenv/config';
import fetch from "node-fetch";

export async function analyzePlantDisease(imageUrl) {
    try {
        // Fetch the image data from the URL
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
        }

        const imageBuffer = await imageResponse.arrayBuffer();

        // Make the direct API call to Hugging Face
        const hfResponse = await fetch("https://router.huggingface.co/hf-inference/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification", {
            headers: {
                // Manually add the Authorization header with your API key
                "Authorization": `Bearer ${process.env.HF_API_KEY}`,
                "Content-Type": "application/octet-stream",
            },
            method: "POST",
            body: Buffer.from(imageBuffer),
        });

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            throw new Error(`Hugging Face API request failed: ${hfResponse.status} - ${errorText}`);
        }

        const result = await hfResponse.json();
        return result;
    } catch (error) {
        console.error("Error analyzing plant disease:", error);
        throw error;
    }
}