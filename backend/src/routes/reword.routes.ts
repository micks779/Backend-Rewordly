import express from "express";
import { rewordText } from "../services/reword.service";

const router = express.Router();

// Route to reword text with AI
router.post("/", async (req, res) => {
    try {
        const { text, instructions } = req.body;
        
        if (!text || !instructions) {
            return res.status(400).json({ error: "Text and instructions are required" });
        }

        console.log(`[${new Date().toISOString()}] Processing reword request`);
        const result = await rewordText(text, instructions);
        console.log(`[${new Date().toISOString()}] Reword complete`);
        
        res.json(result);
    } catch (err) {
        const error = err as Error;
        console.error(`[${new Date().toISOString()}] Reword failed:`, error.message);
        res.status(500).json({ error: "Failed to reword text" });
    }
});

export default router; 