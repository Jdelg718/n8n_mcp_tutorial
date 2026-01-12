import { z } from 'zod';

/**
 * Nutrition response structure from AI analysis
 */
export interface NutritionResponse {
  items: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
  };
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

/**
 * Zod schema for validating AI nutrition responses
 */
export const nutritionResponseSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      unit: z.string(),
    })
  ),
  nutrition: z.object({
    calories: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
    fiber_g: z.number(),
    sugar_g: z.number(),
    sodium_mg: z.number(),
  }),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string(),
});

/**
 * AI-generated insights response structure
 */
export interface InsightsResponse {
  insights: string[];
  recommendations: string[];
  concerns: string[];
}

/**
 * Zod schema for validating AI insights responses
 */
export const insightsResponseSchema = z.object({
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  concerns: z.array(z.string()),
});
