import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '../../../.env') });

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createChatCompletion = async (
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
) => {
  const {
    model = "gpt-3.5-turbo",
    maxTokens = 1000,
    temperature = 0.7
  } = options;

  return await openai.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  });
}; 