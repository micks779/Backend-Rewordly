import express from "express";
import { analyzeEmailContent } from "../services/email-analysis.service";

const router = express.Router();

// Route to analyze email content
router.post("/", async (req, res) => {
    try {
        const { emailContent, emailId } = req.body;
        
        if (!emailContent || !emailId) {
            return res.status(400).json({ error: "Email content and ID are required" });
        }

        console.log(`[${new Date().toISOString()}] Processing email analysis request for: ${emailId.substring(0, 8)}...`);
        const analysis = await analyzeEmailContent(emailContent, emailId);
        console.log(`[${new Date().toISOString()}] Analysis complete for: ${emailId.substring(0, 8)}...`);
        
        res.json(analysis);
    } catch (err) {
        const error = err as Error;
        console.error(`[${new Date().toISOString()}] Analysis failed:`, error.message);
        res.status(500).json({ error: "Failed to analyze email" });
    }
});

export default router;
