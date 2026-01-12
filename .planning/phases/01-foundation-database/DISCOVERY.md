# Phase 1: Foundation & Database - Discovery Research

**Research Date:** 2026-01-11
**Duration:** Standard (30 minutes)
**Focus:** Next.js 14 App Router, Supabase Auth, RLS Policies, Database Design

---

## 1. Standard Stack

### Core Technologies

- **Next.js 14.x** with App Router (stable, production-ready)
- **@supabase/ssr** package (latest recommended approach, replaces deprecated auth-helpers)
- **@supabase/supabase-js** for client library
- **TypeScript** for type safety
- **Zod** for runtime validation (forms, Server Actions)
- **React Hook Form** (optional, for complex client-side forms)

### Required Supabase Libraries

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install zod                      # For validation
npm install react-hook-form @hookform/resolvers  # Optional: advanced forms
```

### File Structure

```
/lib/supabase/
  ├── client.ts       # Browser client (Client Components)
  ├── server.ts       # Server client (Server Components, Server Actions)
  └── middleware.ts   # Middleware client (token refresh)
/middleware.ts        # Root middleware for auth
/app/
  ├── (auth)/         # Auth-related routes
  ├── (dashboard)/    # Protected dashboard routes
  └── actions/        # Server Actions organized by domain
```

---

## 2. Architecture Patterns

### A. Client Creation Pattern

**Three distinct Supabase clients are required** for Next.js 14 App Router:

#### 1. Browser Client (Client Components)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Use for:**
- Client Components (`'use client'`)
- Realtime subscriptions
- Client-side auth state management

#### 2. Server Client (Server Components & Actions)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Cookie setting fails in Server Components
            // This is expected and handled by middleware
          }
        },
      },
    }
  )
}
```

**Use for:**
- Server Components
- Server Actions
- Route Handlers (`route.ts`)
- Data fetching in `page.tsx`

#### 3. Middleware Client (Token Refresh)

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Refresh session and validate user
  const { data: { user } } = await supabase.auth.getUser()

  return supabaseResponse
}
```

```typescript
// middleware.ts (root)
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### B. Server vs Client Component Strategy

#### Server Components (Default)

**Use Server Components for:**
- Initial data fetching (SEO-friendly)
- Database queries
- Authentication checks
- Rendering UI with private data

**Security principle:** "The principle is that a Server Component function body should only see data that the current user issuing the request is authorized to have access to."

**Pattern: Data Transfer Objects (DTOs)**

```typescript
// app/profile/[slug]/page.tsx
import 'server-only'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Always re-authorize on every request
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch only what the user is authorized to see
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, bio, avatar_url')  // Explicit field selection
    .eq('id', user.id)
    .single()

  // Return DTO - never expose full database objects
  return (
    <div>
      <h1>{profile?.username}</h1>
      <p>{profile?.bio}</p>
    </div>
  )
}
```

#### Client Components

**Use Client Components for:**
- Interactive UI (state, events, effects)
- Real-time subscriptions
- Form inputs with validation
- Client-side navigation

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function RealtimeMeals({ initialMeals }) {
  const [meals, setMeals] = useState(initialMeals)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('meal_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meal_logs',
        },
        (payload) => {
          setMeals((current) => [...current, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return <MealList meals={meals} />
}
```

**Best Practice:** Fetch initial data in Server Component, pass to Client Component as props, then subscribe to realtime updates.

### C. Server Actions Pattern

**Server Actions replace API routes** for mutations. They run exclusively on the server.

```typescript
// app/actions/meals.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  calories: z.coerce.number().positive(),
  logged_at: z.string().datetime(),
})

export async function createMeal(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // 1. ALWAYS re-authorize
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 2. Validate input with Zod
  const validatedFields = MealSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    calories: formData.get('calories'),
    logged_at: formData.get('logged_at'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 3. Perform mutation
  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      ...validatedFields.data,
      user_id: user.id,  // Always set user_id server-side
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // 4. Revalidate cache
  revalidatePath('/dashboard/meals')

  return { success: true, data }
}
```

**Using Server Actions in Forms:**

```typescript
'use client'

import { useActionState } from 'react'
import { createMeal } from '@/app/actions/meals'

export function MealForm() {
  const [state, formAction, isPending] = useActionState(createMeal, null)

  return (
    <form action={formAction}>
      <input name="title" required />
      {state?.errors?.title && <p className="error">{state.errors.title}</p>}

      <input name="calories" type="number" required />
      {state?.errors?.calories && <p className="error">{state.errors.calories}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Log Meal'}
      </button>

      {state?.error && <p className="error">{state.error}</p>}
    </form>
  )
}
```

### D. Authentication Flow

#### 1. Email/Password Sign Up

```typescript
// app/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
```

#### 2. OAuth (Google, Apple)

**Setup in Supabase Dashboard:**
1. Auth > Providers > Enable Google/Apple
2. Configure OAuth credentials from provider console
3. Add authorized redirect URIs: `https://[project-ref].supabase.co/auth/v1/callback`

**Client-side implementation:**

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function OAuthButtons() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  const handleAppleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      <button onClick={handleAppleLogin}>Sign in with Apple</button>
    </div>
  )
}
```

**Auth callback handler:**

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

#### 3. Telegram Login Widget (Custom Implementation)

**Current Status:** Telegram is NOT a native Supabase Auth provider. Requires custom implementation.

**Recommended Approach:**

1. **Use Telegram Login Widget** on client side
2. **Verify webhook** on server with Telegram Bot API
3. **Create Supabase user** via Admin API or custom auth flow
4. **Link Telegram ID** to user profile

```typescript
// Telegram widget integration (conceptual)
'use client'

useEffect(() => {
  window.TelegramLoginWidget = {
    dataOnauth: async (user) => {
      // Send to your server action for verification
      await verifyTelegramAuth(user)
    }
  }
}, [])

// Server Action
'use server'
async function verifyTelegramAuth(telegramUser) {
  // 1. Verify hash from Telegram
  // 2. Create or link Supabase user
  // 3. Set session
}
```

**Alternative:** Consider using NextAuth.js with Telegram provider if native Supabase Auth is insufficient.

---

## 3. Row Level Security (RLS) Patterns

### Enabling RLS

```sql
-- Enable RLS on all user-facing tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
```

### Core Policy Patterns

#### Pattern 1: User Owns Record

```sql
-- Users can view their own profiles
CREATE POLICY "view_own_profile"
ON profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

-- Users can update their own profiles
CREATE POLICY "update_own_profile"
ON profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);
```

#### Pattern 2: User Owns Related Records

```sql
-- Users can view their own meal logs
CREATE POLICY "view_own_meals"
ON meal_logs
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Users can insert their own meal logs
CREATE POLICY "insert_own_meals"
ON meal_logs
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own meal logs
CREATE POLICY "update_own_meals"
ON meal_logs
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can delete their own meal logs
CREATE POLICY "delete_own_meals"
ON meal_logs
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);
```

#### Pattern 3: Explicit NULL Check (Security Enhancement)

```sql
-- More secure: explicitly check for NULL
CREATE POLICY "view_own_health_data"
ON health_data
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  (SELECT auth.uid()) = user_id
);
```

### Performance Optimization

**1. Wrap auth.uid() in SELECT:**

```sql
-- ✅ GOOD: Cached per statement
USING ((SELECT auth.uid()) = user_id)

-- ❌ AVOID: Evaluated per row
USING (auth.uid() = user_id)
```

**2. Add Indexes on RLS Columns:**

```sql
-- Index on user_id for faster policy evaluation
CREATE INDEX idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX idx_health_data_user_id ON health_data(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
```

**3. Specify Roles Explicitly:**

```sql
-- Specify TO authenticated to avoid unnecessary policy evaluation
TO authenticated
```

### Multi-Tenant Pattern (If Expanding to Teams/Organizations)

```sql
-- Add tenant_id column
ALTER TABLE meal_logs ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Tenant isolation policy
CREATE POLICY "tenant_isolation"
ON meal_logs
FOR ALL
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id
    FROM team_members
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Index for performance
CREATE INDEX idx_meal_logs_tenant_user
ON meal_logs(tenant_id, user_id);
```

---

## 4. Database Schema Design

### Core Principles

1. **Reference auth.users via Foreign Key**
   - Always use `references auth.users(id) on delete cascade`
   - Only reference primary keys (stable references)

2. **Enable RLS from Day One**
   - Never expose data without RLS policies

3. **Use Triggers for Automation**
   - Auto-create profile records on signup
   - Update timestamps automatically

4. **Index Strategically**
   - Index foreign keys (user_id, tenant_id)
   - Index columns used in RLS policies
   - Index frequently queried columns (logged_at, created_at)

### Profiles Table

```sql
-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Meal Logs Table

```sql
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- Policies (all CRUD operations)
CREATE POLICY "users_view_own_meals"
ON meal_logs FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_insert_own_meals"
ON meal_logs FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_update_own_meals"
ON meal_logs FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_delete_own_meals"
ON meal_logs FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_logged_at ON meal_logs(logged_at DESC);
CREATE INDEX idx_meal_logs_user_logged ON meal_logs(user_id, logged_at DESC);
```

### Health Data Table

```sql
CREATE TABLE health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(4,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_health_data"
ON health_data FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_insert_own_health_data"
ON health_data FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_health_data_user_id ON health_data(user_id);
CREATE INDEX idx_health_data_recorded_at ON health_data(recorded_at DESC);
```

### Goals Table

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('calorie', 'weight', 'exercise', 'custom')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_goals"
ON goals FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status) WHERE status = 'active';
```

---

## 5. Don't Hand Roll (Use Built-In Solutions)

### Use Supabase Auth - Never Build Custom

**DON'T BUILD:**
- Custom JWT generation/validation
- Custom password hashing
- Custom session management
- Custom email verification flows

**USE INSTEAD:**
- `supabase.auth.signUp()`
- `supabase.auth.signInWithPassword()`
- `supabase.auth.signInWithOAuth()`
- Built-in email templates
- Built-in rate limiting

### Use RLS - Never Check Permissions in Code

**❌ WRONG: Application-level checks**

```typescript
// DON'T DO THIS
const { data } = await supabase.from('meal_logs').select('*')
const userMeals = data.filter(meal => meal.user_id === user.id)
```

**✅ RIGHT: Database-level enforcement**

```typescript
// RLS automatically filters
const { data } = await supabase.from('meal_logs').select('*')
// Only returns meals belonging to current user
```

### Use Server Actions - Not API Routes

**For Next.js 14 mutations:**
- Use Server Actions (`'use server'`)
- Skip creating `app/api/` routes for CRUD
- Server Actions integrate better with forms and caching

### Use Realtime - Not Polling

**❌ WRONG:**

```typescript
// Don't poll
setInterval(async () => {
  const { data } = await supabase.from('meal_logs').select('*')
  setMeals(data)
}, 5000)
```

**✅ RIGHT:**

```typescript
// Use Realtime subscriptions
const channel = supabase
  .channel('meal_updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_logs' },
    (payload) => handleChange(payload))
  .subscribe()
```

### Use Middleware - Not Manual Token Refresh

**Always use middleware pattern** shown above - it handles token refresh automatically and passes refreshed tokens to Server Components.

---

## 6. Common Pitfalls & How to Avoid

### Pitfall 1: Using getSession() in Server Code

**❌ WRONG:**

```typescript
const { data: { session } } = await supabase.auth.getSession()
// Session can be stale or tampered with
```

**✅ RIGHT:**

```typescript
const { data: { user } } = await supabase.auth.getUser()
// Always validates token with Supabase Auth server
```

**Why:** `getSession()` reads from local storage/cookies without validation. `getUser()` validates with the auth server on every call.

### Pitfall 2: Not Re-authorizing in Server Actions

**❌ WRONG:**

```typescript
'use server'
export async function deletePost(postId: string) {
  await db.delete(postId)  // No auth check!
}
```

**✅ RIGHT:**

```typescript
'use server'
export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verify user owns the post
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (post.user_id !== user.id) throw new Error('Forbidden')

  await supabase.from('posts').delete().eq('id', postId)
}
```

### Pitfall 3: Exposing Sensitive Data to Client Components

**❌ WRONG:**

```typescript
// Server Component
async function Page() {
  const user = await getUserWithPrivateData()
  return <ClientProfile user={user} />  // Exposes everything!
}
```

**✅ RIGHT:**

```typescript
// Server Component
async function Page() {
  const user = await getUserWithPrivateData()

  // Only pass necessary fields
  return <ClientProfile
    name={user.name}
    avatar={user.avatar}
    // Don't pass email, phone, etc.
  />
}
```

### Pitfall 4: Forgetting to Enable RLS

**Always enable RLS immediately:**

```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
```

**Test RLS policies** before going to production:

```sql
-- Test as specific user in Supabase SQL Editor
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM meal_logs;  -- Should only see that user's meals
```

### Pitfall 5: Not Cleaning Up Realtime Subscriptions

**❌ WRONG:**

```typescript
useEffect(() => {
  supabase.channel('meals').on('postgres_changes', ...).subscribe()
  // Missing cleanup!
}, [])
```

**✅ RIGHT:**

```typescript
useEffect(() => {
  const channel = supabase.channel('meals')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_logs' },
      (payload) => handleChange(payload))
    .subscribe()

  return () => {
    supabase.removeChannel(channel)  // Cleanup!
  }
}, [supabase])
```

### Pitfall 6: Not Validating Server Action Inputs

**❌ WRONG:**

```typescript
'use server'
export async function updateProfile(formData: FormData) {
  const name = formData.get('name')  // No validation!
  await db.update({ name })
}
```

**✅ RIGHT:**

```typescript
'use server'
import { z } from 'zod'

const ProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
})

export async function updateProfile(formData: FormData) {
  const validated = ProfileSchema.safeParse({
    name: formData.get('name'),
    bio: formData.get('bio'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  await db.update(validated.data)
}
```

### Pitfall 7: Server Component Hydration Errors

**❌ WRONG:**

```typescript
// Server Component
export default async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} randomId={Math.random()} />
  // randomId will differ between server and client!
}
```

**✅ RIGHT:**

```typescript
// Generate IDs on server only, pass stable data
export default async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} id={data.id} />
}
```

### Pitfall 8: Mixing Client and Server Supabase Clients

**❌ WRONG:**

```typescript
// Server Component
import { createClient } from '@/lib/supabase/client'  // Browser client!
```

**✅ RIGHT:**

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'  // Server client

// Client Component
import { createClient } from '@/lib/supabase/client'  // Browser client
```

### Pitfall 9: SQL Injection in Raw Queries

**❌ WRONG:**

```typescript
const { data } = await supabase.rpc('my_function', {
  query: `SELECT * FROM users WHERE id = ${userId}`  // Vulnerable!
})
```

**✅ RIGHT:**

```typescript
// Use parameterized queries via Supabase's query builder
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)  // Automatically escaped
```

### Pitfall 10: Not Handling Loading States in Server Actions

**✅ RIGHT:**

```typescript
'use client'

import { useActionState } from 'react'

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, null)

  return (
    <form action={formAction}>
      <input name="field" />
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  )
}
```

---

## 7. Security Checklist

Before deploying Phase 1:

- [ ] RLS enabled on all tables
- [ ] All policies tested with real user UUIDs
- [ ] `auth.getUser()` used in all Server Components/Actions (never `getSession()`)
- [ ] Server Actions re-authorize on every call
- [ ] All Server Action inputs validated with Zod
- [ ] No sensitive data exposed to Client Components
- [ ] Middleware properly refreshes tokens
- [ ] Realtime subscriptions cleaned up properly
- [ ] Database triggers tested (profile creation)
- [ ] Service role key never exposed to client
- [ ] Environment variables properly configured (`.env.local`)
- [ ] Indexes created on foreign keys and RLS columns

---

## 8. Performance Optimization Tips

1. **Use Partial Indexes**
   ```sql
   CREATE INDEX idx_active_goals ON goals(user_id) WHERE status = 'active';
   ```

2. **Limit Realtime Subscription Scope**
   ```typescript
   // Subscribe only to user's own data
   supabase
     .channel('my_meals')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'meal_logs',
       filter: `user_id=eq.${user.id}`  // Filter at database level
     }, handleChange)
     .subscribe()
   ```

3. **Use `select()` to Limit Columns**
   ```typescript
   // Only fetch what you need
   const { data } = await supabase
     .from('meal_logs')
     .select('id, title, calories, logged_at')  // Not 'SELECT *'
   ```

4. **Leverage Next.js Caching**
   ```typescript
   // Server Component with cache
   export const revalidate = 60  // Revalidate every 60 seconds

   export default async function Page() {
     const data = await fetchData()
     return <View data={data} />
   }
   ```

5. **Use Database Functions for Complex Queries**
   ```sql
   -- Instead of fetching all data and processing in JS
   CREATE FUNCTION get_daily_calorie_totals(user_uuid UUID, days INTEGER)
   RETURNS TABLE(date DATE, total_calories INTEGER) AS $$
     SELECT logged_at::DATE, SUM(calories)::INTEGER
     FROM meal_logs
     WHERE user_id = user_uuid
       AND logged_at >= CURRENT_DATE - days
     GROUP BY logged_at::DATE
     ORDER BY logged_at::DATE DESC;
   $$ LANGUAGE sql STABLE;
   ```

---

## 9. Testing Strategy

### Test RLS Policies

```sql
-- Set session as specific user
SET request.jwt.claim.sub = 'user-uuid-1';

-- Try to access another user's data
SELECT * FROM meal_logs WHERE user_id = 'user-uuid-2';
-- Should return 0 rows

-- Try to insert with wrong user_id
INSERT INTO meal_logs (user_id, title, calories)
VALUES ('user-uuid-2', 'Test', 500);
-- Should fail
```

### Test Server Actions

```typescript
// Use Vitest or Jest
import { describe, it, expect } from 'vitest'
import { createMeal } from '@/app/actions/meals'

describe('createMeal', () => {
  it('should reject unauthenticated requests', async () => {
    const formData = new FormData()
    formData.set('title', 'Test Meal')

    const result = await createMeal(null, formData)
    expect(result.error).toBe('Unauthorized')
  })

  it('should validate input', async () => {
    const formData = new FormData()
    formData.set('title', '')  // Invalid

    const result = await createMeal(null, formData)
    expect(result.errors).toHaveProperty('title')
  })
})
```

### Test Realtime Subscriptions

```typescript
// Integration test
it('should receive realtime updates', async () => {
  const updates = []
  const channel = supabase
    .channel('test')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meal_logs' },
      (payload) => updates.push(payload))
    .subscribe()

  // Insert test data
  await supabase.from('meal_logs').insert({ title: 'Test' })

  // Wait for update
  await new Promise(resolve => setTimeout(resolve, 1000))

  expect(updates.length).toBe(1)

  await supabase.removeChannel(channel)
})
```

---

## 10. Environment Variables

```bash
# .env.local (Never commit!)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: For server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # NEVER expose to client!
```

---

## 11. Migration Strategy

### Use Supabase Migrations

```bash
# Initialize Supabase locally
npx supabase init

# Create migration
npx supabase migration new create_profiles_table

# Edit migration file
# supabase/migrations/[timestamp]_create_profiles_table.sql

# Apply locally
npx supabase db reset

# Push to production
npx supabase db push
```

### Example Migration

```sql
-- supabase/migrations/20260111_initial_schema.sql

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Meal logs table
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- Policies for meal_logs
CREATE POLICY "users_view_own_meals" ON meal_logs FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_insert_own_meals" ON meal_logs FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_update_own_meals" ON meal_logs FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_delete_own_meals" ON meal_logs FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_logged_at ON meal_logs(logged_at DESC);
CREATE INDEX idx_meal_logs_user_logged ON meal_logs(user_id, logged_at DESC);

-- Health data table
CREATE TABLE health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(4,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_health_data" ON health_data FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_insert_own_health_data" ON health_data FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_health_data_user_id ON health_data(user_id);
CREATE INDEX idx_health_data_recorded_at ON health_data(recorded_at DESC);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('calorie', 'weight', 'exercise', 'custom')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_goals" ON goals FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status) WHERE status = 'active';

-- Trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 12. Next Steps for Implementation

1. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr zod
   ```

2. **Create utility files**
   - `/lib/supabase/client.ts`
   - `/lib/supabase/server.ts`
   - `/lib/supabase/middleware.ts`
   - `/middleware.ts`

3. **Set up environment variables**
   - Copy from Supabase dashboard
   - Add to `.env.local`
   - Add to `.env.example` (without values)

4. **Create database schema**
   - Create migration file
   - Define tables (profiles, meal_logs, health_data, goals)
   - Enable RLS
   - Create policies
   - Add indexes
   - Create triggers

5. **Set up authentication**
   - Create login/signup pages
   - Configure OAuth providers in Supabase dashboard
   - Add auth callback route
   - Implement middleware

6. **Test RLS policies**
   - Use Supabase SQL Editor
   - Test with multiple user UUIDs
   - Verify isolation

7. **Implement initial UI**
   - Auth forms
   - Protected dashboard layout
   - Profile page

---

## Sources

### Next.js 14 & Server Components
- [Next.js App Router Advanced Patterns for 2026](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7)
- [Getting Started: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [How to Think About Security in Next.js](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms)

### Supabase RLS & Security
- [Enforcing Row Level Security in Supabase: Multi-Tenant Architecture](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2)
- [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Multi-Tenant Applications with RLS on Supabase](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)
- [Best Practices for Supabase](https://www.leanware.co/insights/supabase-best-practices)

### Supabase Auth & Next.js Integration
- [Setting up Server-Side Auth for Next.js | Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Social Login | Supabase Docs](https://supabase.com/docs/guides/auth/social-login)
- [Login with Google | Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [User Management | Supabase](https://supabase.com/docs/guides/auth/managing-user-data)

### Supabase Realtime
- [Using Realtime with Next.js | Supabase](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [Building Real-time Magic: Supabase Subscriptions in Next.js 15](https://dev.to/lra8dev/building-real-time-magic-supabase-subscriptions-in-nextjs-15-2kmp)

### Server Actions & Form Validation
- [Handling Forms in Next.js with Server Actions and Zod](https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod)
- [Next.js form validation on client and server with Zod](https://dev.to/bookercodes/nextjs-form-validation-on-the-client-and-server-with-zod-lbc)
- [Handling Forms in Next.js with next/form, Server Actions, and Zod](https://medium.com/@sorayacantos/handling-forms-in-next-js-with-next-form-server-actions-useactionstate-and-zod-validation-15f9932b0a9e)

### Telegram Integration
- [Add OAuth Social Login for Telegram (GitHub Discussion)](https://github.com/orgs/supabase/discussions/19363)
- [Telegram as an Auth Provider (GitHub Issue)](https://github.com/supabase/auth/issues/167)
- [Building a Telegram Bot | Supabase](https://supabase.com/docs/guides/functions/examples/telegram-bot)

---

**End of Discovery Research**
