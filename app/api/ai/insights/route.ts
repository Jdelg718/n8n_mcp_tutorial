import { NextRequest } from 'next/server';
import { analyzeNutritionInsights } from '@/lib/ai/openrouter';
import { createClient } from '@/lib/supabase/server';
import { format, parseISO, getDay } from 'date-fns';

/**
 * AI nutrition insights API endpoint
 *
 * POST /api/ai/insights
 * Body: { startDate: string, endDate: string }
 *
 * Analyzes meal patterns over a date range and returns personalized insights,
 * recommendations, and concerns. Uses GPT-4o-mini for cost-effective text analysis.
 *
 * CRITICAL: API route (not Server Action) allows client-side loading states
 * for long-running AI analysis (3-10 seconds, potentially longer for complex analysis).
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
  const { startDate, endDate } = body;

  // Validate input
  if (!startDate || !endDate) {
    return Response.json(
      { error: 'startDate and endDate required' },
      { status: 400 }
    );
  }

  try {
    // Fetch all meals for the date range with nutrition data
    const { data: meals, error } = await supabase
      .from('meal_logs')
      .select('name, meal_type, calories, protein, carbs, fat, fiber, sugar, sodium, logged_at')
      .gte('logged_at', startDate)
      .lte('logged_at', endDate)
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to fetch meal data' }, { status: 500 });
    }

    // Check if there's enough data for analysis
    if (!meals || meals.length === 0) {
      return Response.json({
        insights: ['No meals logged in this time period. Start logging meals to see insights.'],
        recommendations: ['Log your meals regularly to get personalized nutrition insights.'],
        concerns: [],
      });
    }

    // Calculate basic statistics
    const totalMeals = meals.length;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    meals.forEach((meal) => {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
      totals.fiber += meal.fiber || 0;
      totals.sugar += meal.sugar || 0;
      totals.sodium += meal.sodium || 0;
    });

    // Calculate averages per day
    const avgPerDay = {
      calories: Math.round(totals.calories / days),
      protein: Math.round((totals.protein / days) * 10) / 10,
      carbs: Math.round((totals.carbs / days) * 10) / 10,
      fat: Math.round((totals.fat / days) * 10) / 10,
      fiber: Math.round((totals.fiber / days) * 10) / 10,
    };

    // Analyze day-of-week patterns
    const dayOfWeekCounts: Record<number, number> = {};
    meals.forEach((meal) => {
      const day = getDay(parseISO(meal.logged_at));
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
    });

    // Analyze meal type distribution
    const mealTypeCounts: Record<string, number> = {};
    meals.forEach((meal) => {
      if (meal.meal_type) {
        mealTypeCounts[meal.meal_type] = (mealTypeCounts[meal.meal_type] || 0) + 1;
      }
    });

    // Hardcoded nutrition goals (from Phase 4 decision)
    const goals = {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 67,
    };

    // Calculate goal adherence percentages
    const goalAdherence = {
      calories: Math.round((avgPerDay.calories / goals.calories) * 100),
      protein: Math.round((avgPerDay.protein / goals.protein) * 100),
      carbs: Math.round((avgPerDay.carbs / goals.carbs) * 100),
      fat: Math.round((avgPerDay.fat / goals.fat) * 100),
    };

    // Build AI prompt with nutrition data summary
    const dateRangeStr = `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;

    const prompt = `Analyze this user's nutrition data and provide personalized insights.

**Time Period:** ${dateRangeStr} (${days} days)

**Nutrition Goals:**
- Calories: ${goals.calories} kcal/day
- Protein: ${goals.protein}g/day
- Carbs: ${goals.carbs}g/day
- Fat: ${goals.fat}g/day

**Actual Performance:**
- Total meals logged: ${totalMeals} (${(totalMeals / days).toFixed(1)} meals/day)
- Average calories: ${avgPerDay.calories} kcal/day (${goalAdherence.calories}% of goal)
- Average protein: ${avgPerDay.protein}g/day (${goalAdherence.protein}% of goal)
- Average carbs: ${avgPerDay.carbs}g/day (${goalAdherence.carbs}% of goal)
- Average fat: ${avgPerDay.fat}g/day (${goalAdherence.fat}% of goal)
- Average fiber: ${avgPerDay.fiber}g/day

**Meal Patterns:**
- Meal type distribution: ${Object.entries(mealTypeCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}
- Day-of-week patterns: ${Object.entries(dayOfWeekCounts).map(([day, count]) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${dayNames[Number(day)]}: ${count}`;
}).join(', ')}

**Top meals by calories:**
${meals
  .filter((m) => m.calories)
  .sort((a, b) => (b.calories || 0) - (a.calories || 0))
  .slice(0, 5)
  .map((m) => `- ${m.name} (${m.calories} kcal, P:${m.protein || 0}g C:${m.carbs || 0}g F:${m.fat || 0}g)`)
  .join('\n')}

Please provide:
1. **Insights**: 3-5 pattern observations based on this data
2. **Recommendations**: 3-5 specific, actionable suggestions for improvement
3. **Concerns**: Any significant nutritional issues (leave empty if none)

Focus on being specific, encouraging, and data-driven. Reference the actual numbers provided.`;

    // Call AI for insights generation (with 30s timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const result = await analyzeNutritionInsights(prompt);
      clearTimeout(timeoutId);
      return Response.json(result);
    } catch (aiError) {
      clearTimeout(timeoutId);
      if ((aiError as Error).name === 'AbortError') {
        return Response.json(
          { error: 'Analysis timeout - please try again' },
          { status: 504 }
        );
      }
      throw aiError;
    }
  } catch (error) {
    console.error('AI insights error:', error);
    return Response.json(
      {
        error: 'Analysis failed',
        insights: ['Unable to generate insights at this time.'],
        recommendations: ['Try logging more meals for better analysis.'],
        concerns: [],
      },
      { status: 500 }
    );
  }
}
