import { createChatCompletion } from './openai.service';

export interface ComposeResult {
    composedEmail: string;
}

export const composeEmail = async (context: string): Promise<ComposeResult> => {
    try {
        const prompt = `Please compose a professional email based on the following context:

${context}

Please write a complete, well-structured email that addresses the context provided. Include appropriate greetings and closings. Make it professional, clear, and actionable.`;

        const completion = await createChatCompletion([
            {
                role: "system",
                content: "You are a professional email writing assistant. Compose complete, well-structured emails based on the user's context. Always include appropriate greetings and closings. Make emails professional, clear, and actionable."
            },
            {
                role: "user",
                content: prompt
            }
        ], { maxTokens: 1500 });

        const composedEmail = completion.choices[0]?.message?.content?.trim() || '';

        return {
            composedEmail: composedEmail
        };
    } catch (error) {
        console.error('Error in composeEmail:', error);
        throw new Error('Failed to compose email with AI');
    }
}; 