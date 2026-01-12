import { NextRequest } from 'next/server';
import { analyzeTextMeal, analyzeImageMeal } from '@/lib/ai/openrouter';
import { createClient } from '@/lib/supabase/server';

/**
 * AI nutrition analysis API endpoint
 *
 * POST /api/ai/analyze
 * Body: { text?: string, imageUrl?: string }
 *
 * Returns structured nutrition data with confidence scoring.
 * Uses GPT-4o-mini for text, GPT-4o for images (cost optimized).
 *
 * CRITICAL: API route (not Server Action) allows client-side loading states
 * for long-running AI analysis (3-10 seconds).
 */
export async function POST(req: NextRequest) {
  // Authentication check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  const body = await req.json();
  const { text, imageUrl } = body;

  // Validate input
  if (!text && !imageUrl) {
    return Response.json(
      { error: 'Text or imageUrl required' },
      { status: 400 }
    );
  }

  try {
    let result;

    if (imageUrl) {
      // Use GPT-4o for image analysis
      result = await analyzeImageMeal(imageUrl);
    } else if (text) {
      // Use GPT-4o-mini for text analysis (33x cheaper)
      result = await analyzeTextMeal(text);
    }

    return Response.json(result);
  } catch (error) {
    console.error('AI analysis error:', error);
    return Response.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
