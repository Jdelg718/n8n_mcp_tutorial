import { nutritionResponseSchema, type NutritionResponse } from './types';

/**
 * Parse and validate AI nutrition response
 *
 * Validates the JSON content from AI against Zod schema
 * to ensure type safety and correct structure
 *
 * @param content - Raw JSON string from AI response
 * @returns Validated NutritionResponse object
 * @throws ZodError if validation fails
 */
export function parseNutritionResponse(content: string): NutritionResponse {
  const parsed = JSON.parse(content);
  return nutritionResponseSchema.parse(parsed);
}
