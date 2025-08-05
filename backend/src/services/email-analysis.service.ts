import { createChatCompletion } from "./openai.service";
import { setCache, getCache } from "../utils/cache";

type Priority = "High" | "Medium" | "Low";
type Sentiment = "Positive" | "Neutral" | "Negative";

export interface EmailAnalysisResult {
    summary: string;
    actionItems: string[];
    priority: Priority;
    sentiment: Sentiment;
    category: string;
    rawAnalysis: string;
}

// Constants for content handling
const MAX_CONTENT_LENGTH = 12000; // Maximum characters to process
const CHUNK_SIZE = 8000; // Size of each chunk for processing

export async function analyzeEmailContent(emailContent: string, emailId: string): Promise<EmailAnalysisResult> {
    try {
        // Check cache first
        const cachedResult = getCache(emailId);
        if (cachedResult) {
            console.log(`[${new Date().toISOString()}] Returning cached analysis for email: ${emailId.substring(0, 8)}...`);
            return cachedResult;
        }

        // Handle long content
        if (emailContent.length > MAX_CONTENT_LENGTH) {
            console.log(`[${new Date().toISOString()}] Long email detected (${emailContent.length} chars), chunking content...`);
            emailContent = emailContent.substring(0, MAX_CONTENT_LENGTH);
        }

        // Split into chunks if needed
        const chunks = [];
        for (let i = 0; i < emailContent.length; i += CHUNK_SIZE) {
            chunks.push(emailContent.substring(i, i + CHUNK_SIZE));
        }

        // Analyze each chunk
        const chunkResults: EmailAnalysisResult[] = [];
        for (const chunk of chunks) {
            const result = await analyzeChunk(chunk);
            chunkResults.push(result);
        }

        // Merge results if multiple chunks
        const result = chunks.length > 1 ? mergeResults(chunkResults) : chunkResults[0];

        // Cache the result
        setCache(emailId, result);
        return result;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Analysis failed:`, error);
        throw new Error("Failed to analyze email content");
    }
}

async function analyzeChunk(content: string): Promise<EmailAnalysisResult> {
    const systemMessage = `You are an AI assistant providing email analysis.
Focus on providing a simple, clear summary of the email content.
IMPORTANT: 
- Format your response exactly as shown in the prompt
- Keep the summary concise (20-30 words)
- Focus on the main purpose or key message of the email`;

    const prompt = `Analyze this email and provide a simple summary:

**Summary**
Write a single sentence (20-30 words) describing the main purpose or key message of this email.

Email content:
${content}`;

    const completion = await createChatCompletion([
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
    ], { model: "gpt-4", temperature: 0.3 });

    const response = completion.choices[0].message?.content || "";
    return parseAnalysisResponse(response);
}

function mergeResults(results: EmailAnalysisResult[]): EmailAnalysisResult {
    // For simple summary analysis, just use the first result
    const merged: EmailAnalysisResult = {
        summary: results[0].summary,
        actionItems: [],
        priority: 'Medium',
        sentiment: 'Neutral',
        category: 'Standard',
        rawAnalysis: results[0].rawAnalysis
    };

    return merged;
}

function parseAnalysisResponse(response: string): EmailAnalysisResult {
    const result: EmailAnalysisResult = {
        summary: '',
        actionItems: [],
        priority: 'Medium',
        sentiment: 'Neutral',
        category: 'Standard',
        rawAnalysis: response
    };

    // Look for the Summary section
    const summaryMatch = response.match(/\*\*Summary\*\*\s*\n(.*?)(?=\n\*\*|$)/s);
    if (summaryMatch) {
        result.summary = summaryMatch[1].trim();
    }

    // If no summary found, try to extract from the raw response
    if (!result.summary && response.includes('Summary')) {
        const lines = response.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('Summary')) {
                if (i + 1 < lines.length) {
                    result.summary = lines[i + 1].trim();
                    break;
                }
            }
        }
    }

    return result;
}
