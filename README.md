# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## AI generation setup

The AI draft generation flow calls a **Supabase Edge Function** directly. Lovable
is used only as the frontend builder — no Lovable Cloud secrets or Lovable-hosted
AI features are involved in this flow.

### Frontend env vars (public)

Set these in your frontend environment (`.env`). They are safe to expose to the
browser:

- `VITE_SUPABASE_URL` — your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/publishable key.

The client helper `src/lib/generate-draft.ts` reads these and POSTs to
`${VITE_SUPABASE_URL}/functions/v1/generate-evaluation-draft`. If either var is
missing, or the function call fails, the app falls back to a deterministic local
draft so the demo always works.

### Supabase Edge Function secret (server-only)

The function source lives at `supabase/functions/generate-evaluation-draft/index.ts`
and is intended to be deployed to **Supabase**, not Lovable Cloud.

Store the OpenAI key **only** in Supabase Edge Function secrets:

```sh
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy generate-evaluation-draft
```

The function reads it via `Deno.env.get("OPENAI_API_KEY")`. Do not add
`OPENAI_API_KEY` to Lovable Cloud secrets or to any frontend env file — it must
never appear in client code.
