import OpenAI from 'openai';
import { NUTRITION_SYSTEM_PROMPT } from './prompts';
import { nutritionResponseSchema, type NutritionResponse } from './types';

/**
 * OpenRouter client configured with OpenAI SDK
 * Uses baseURL override to point to OpenRouter API
 */
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Meal Tracker SaaS',
  },
});

/**
 * Analyze text meal description using GPT-4o-mini
 * Cost-optimized for text-only analysis (33x cheaper than GPT-4o)
 *
 * @param description - Natural language meal description
 * @returns Structured nutrition data with confidence level
 */
export async function analyzeTextMeal(
  description: string
): Promise<NutritionResponse> {
  const response = await openrouter.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: NUTRITION_SYSTEM_PROMPT },
      { role: 'user', content: `Analyze this meal: ${description}` },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content returned from AI');
  }

  const parsed = JSON.parse(content);
  return nutritionResponseSchema.parse(parsed);
}

/**
 * Analyze meal image using GPT-4o (NOT mini)
 *
 * IMPORTANT: Uses GPT-4o (not mini) because mini uses 20-33x more tokens
 * for vision tasks, making costs comparable. Research shows mini provides
 * no cost benefit for image analysis.
 *
 * @param imageUrl - Public URL of meal image
 * @returns Structured nutrition data with confidence level
 */
export async function analyzeImageMeal(
  imageUrl: string
): Promise<NutritionResponse> {
  const response = await openrouter.chat.completions.create({
    model: 'openai/gpt-4o', // Use full GPT-4o for vision
    messages: [
      { role: 'system', content: NUTRITION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this meal image and provide detailed nutrition information.',
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content returned from AI');
  }

  const parsed = JSON.parse(content);
  return nutritionResponseSchema.parse(parsed);
}
