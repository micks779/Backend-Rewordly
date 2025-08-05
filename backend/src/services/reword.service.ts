import { createChatCompletion } from './openai.service';

export interface RewordResult {
    rewordedText: string;
}

export const rewordText = async (text: string, instructions: string): Promise<RewordResult> => {
    try {
        const prompt = `Please reword the following text according to these instructions: "${instructions}"

Original text:
${text}

Please provide only the reworded text without any additional commentary or formatting.`;

        const completion = await createChatCompletion([
            {
                role: "system",
                content: "You are a professional email writing assistant. Reword the given text according to the user's instructions. Maintain the original meaning while adjusting the tone and style as requested."
            },
            {
                role: "user",
                content: prompt
            }
        ]);

        const rewordedText = completion.choices[0]?.message?.content?.trim() || text;

        return {
            rewordedText: rewordedText
        };
    } catch (error) {
        console.error('Error in rewordText:', error);
        throw new Error('Failed to reword text with AI');
    }
}; 