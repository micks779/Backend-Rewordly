import express from "express";
import { composeEmail } from "../services/compose.service";

const router = express.Router();

// Route to compose email with AI
router.post("/", async (req, res) => {
    try {
        const { context } = req.body;
        
        if (!context) {
            return res.status(400).json({ error: "Context is required" });
        }

        console.log(`[${new Date().toISOString()}] Processing compose request`);
        const result = await composeEmail(context);
        console.log(`[${new Date().toISOString()}] Compose complete`);
        
        res.json(result);
    } catch (err) {
        const error = err as Error;
        console.error(`[${new Date().toISOString()}] Compose failed:`, error.message);
        res.status(500).json({ error: "Failed to compose email" });
    }
});

export default router; 