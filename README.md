This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment

* WSL2 Ubuntu 22.04
* Node.js v20.x via nvm
* npm v10+

## Setup Steps

```bash
nvm use 20
npm install
cp .env.example .env.local
npm run dev
```

## Required Env Vars (Supabase)

The `.env.local` file must include the following keys:

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`

You can find these in your Supabase Dashboard under:
**Project → Settings → API → anon public key**

> [!WARNING]
> Do NOT use the service role key in public environment variables.

## CSS / Tailwind Import Ordering

In `app/globals.css`, Tailwind is initialized via `@import "tailwindcss";`.

**Important**: Any other `@import url(...)` rules (like Google Fonts) **must come BEFORE** the Tailwind import.

If you place other imports after Tailwind, PostCSS / Turbopack will fail with:
> "@import rules must precede all rules"

**Correct Order in `app/globals.css`:**
```css
@import url('https://fonts.googleapis.com/...');
@import "tailwindcss";
```

### Recommendation: next/font/google

To improve performance and avoid CSS import ordering issues, it is recommended to replace the Google Fonts CSS import with `next/font/google`.

You can configure `DM Sans` (or other fonts) in `app/layout.tsx` using the Next.js font system. This loads the font optimally and removes the need for manual `@import` statements in your CSS.

## Troubleshooting

### Supabase error: "URL and Key required"

**Cause**: Missing environment variables.
**Fix**: Ensure `.env.local` exists in the project root and includes the required keys. Restart the dev server after creating the file.

### CSS Parsing Error at line ~1500

**Cause**: Google Fonts `@import` placed after the Tailwind import in `globals.css`.
**Fix**: Move the font import above the Tailwind import line, or switch to using `next/font/google`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
