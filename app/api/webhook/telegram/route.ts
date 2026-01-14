import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Webhook request schema
const WebhookRequestSchema = z.object({
  user_id: z.string().uuid().optional(),
  telegram_chat_id: z.union([z.string(), z.number()]).optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  logged_at: z.string().datetime().optional(), // ISO timestamp
  photo_url: z.string().url().nullable().optional(),
  source: z.enum(['telegram_text', 'telegram_image'], {
    message: 'Source must be telegram_text or telegram_image',
  }),
  // Optional AI-analyzed nutrition data
  calories: z.number().int().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  ai_confidence: z.number().min(0).max(1).optional(), // 0.0 to 1.0
}).refine(data => data.user_id || data.telegram_chat_id, {
  message: "Either user_id or telegram_chat_id must be provided"
});

type WebhookRequest = z.infer<typeof WebhookRequestSchema>

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication - verify webhook secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (!expectedSecret) {
      console.error('WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const providedSecret = authHeader.substring(7) // Remove "Bearer " prefix

    if (providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid webhook secret' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const validated = WebhookRequestSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data: WebhookRequest = validated.data
    let targetUserId = data.user_id;

    // 3. Create Supabase admin client (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 3.5 Lookup User ID if only telegram_chat_id is provided
    if (!targetUserId && data.telegram_chat_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('telegram_chat_id', String(data.telegram_chat_id))
        .single();

      if (profileError || !profile) {
        console.warn(`Telegram user lookup failed for chat_id: ${data.telegram_chat_id}`);
        return NextResponse.json(
          { error: 'User not registered. Please link your Telegram account on the website.' },
          { status: 404 }
        );
      }

      targetUserId = profile.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User identification failed' }, { status: 400 });
    }

    // 4. Insert meal log with admin client
    const { data: meal, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: targetUserId,
        title: data.title,
        description: data.description || null,
        meal_type: data.meal_type || 'snack', // Default to snack if not provided
        logged_at: data.logged_at ? new Date(data.logged_at) : new Date(),
        photo_url: data.photo_url || null,
        source: data.source,
        // Nutrition fields (optional)
        calories: data.calories ?? null,
        protein: data.protein ?? null,
        carbs: data.carbs ?? null,
        fat: data.fat ?? null,
        fiber: data.fiber ?? null,
        sugar: data.sugar ?? null,
        sodium: data.sodium ?? null,
        ai_confidence: data.ai_confidence ?? null,
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create meal log' },
        { status: 500 }
      )
    }

    // 5. Return success response
    return NextResponse.json(
      {
        id: meal.id,
        created_at: meal.created_at,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
