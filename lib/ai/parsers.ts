import {
  nutritionResponseSchema,
  type NutritionResponse,
  insightsResponseSchema,
  type InsightsResponse
} from './types';

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

/**
 * Parse and validate AI insights response
 *
 * Validates the JSON content from AI against Zod schema
 * to ensure type safety and correct structure
 *
 * @param content - Raw JSON string from AI response
 * @returns Validated InsightsResponse object
 * @throws ZodError if validation fails
 */
export function parseInsightsResponse(content: string): InsightsResponse {
  const parsed = JSON.parse(content);
  return insightsResponseSchema.parse(parsed);
}
