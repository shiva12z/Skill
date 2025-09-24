Skill
# Skill

A modern, AI-assisted resume analysis and career guidance web app built with React, TypeScript, Vite, Tailwind CSS, and Supabase. The app lets users authenticate, analyze resumes against generic industry profiles or specific job descriptions, view match scores, get strengths/weaknesses, see suggested roles, and receive curated course recommendations to close skill gaps.

This README documents the project architecture, environment setup, scripts, tech stack, and how to run and develop locally.

## Table of Contents

- **Overview**
- **Key Features**
- **Tech Stack**
- **Project Structure**
- **Environment Setup**
- **Scripts**
- **Development**
- **Architecture**
- **Supabase Setup Notes**
- **AI (Gemini) Integration**
- **Styling**
- **Linting**
- **Build & Preview**
- **Deployment**
- **Troubleshooting**

## Overview

The app provides a simple flow:

1. Users land on a landing page and can sign up or sign in (via Supabase).
2. After signing in, they access a dashboard where they can upload or paste resume details and optionally a job description.
3. The app analyzes the resume using Google Gemini (if configured) or a local heuristic fallback and returns:
   - Overall score and breakdown
   - Strengths and weaknesses
   - Suggested roles with match scores
   - Curated course recommendations per missing/partial skills

Core entry points and logic:

- `src/main.tsx` mounts the React app.
- `src/App.tsx` handles simple page routing between landing, auth, dashboard, and profile.
- `src/contexts/AuthContext.tsx` manages authentication state via Supabase.
- `src/lib/gemini.ts` handles AI (Gemini) analysis and a heuristic fallback.
- `src/lib/courses.ts` contains curated course recommendations by skill.
- `src/lib/supabase.ts` configures the Supabase client from environment variables.

## Key Features

- **Authentication** using Supabase Auth (`src/contexts/AuthContext.tsx`).
- **AI-powered resume analysis** using Gemini (`src/lib/gemini.ts`) with strict JSON parsing and sanitization.
- **Heuristic fallback** when `VITE_GEMINI_API_KEY` is not set.
- **Course recommendations** per role/skill via a curated map (`src/lib/courses.ts`).
- **Dashboard UI** components for charts and results (see `src/components/`).
- **Tailwind CSS**-based styling with a small reusable UI library (e.g., `src/components/ui/Button.tsx`).

## Tech Stack

- React 18 + TypeScript
- Vite 5 (`vite.config.ts`)
- Tailwind CSS 3 (`tailwind.config.js`, `postcss.config.js`)
- Supabase JS SDK (`@supabase/supabase-js`)
- Google Gemini API (optional)
- ESLint 9

## Project Structure

```
Skill/
├─ src/
│  ├─ components/
│  │  ├─ auth/
│  │  ├─ charts/
│  │  ├─ dashboard/
│  │  ├─ landing/
│  │  ├─ layout/
│  │  ├─ profile/
│  │  └─ ui/
│  │     └─ Button.tsx
│  ├─ contexts/
│  │  └─ AuthContext.tsx
│  ├─ lib/
│  │  ├─ gemini.ts
│  │  ├─ supabase.ts
│  │  ├─ courses.ts
│  │  ├─ database.types.ts
│  │  └─ utils.ts
│  ├─ types/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ index.css
│  └─ vite-env.d.ts
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ tailwind.config.js
├─ postcss.config.js
├─ .env.example
└─ README.md
```

## Environment Setup

1. Install Node.js (LTS recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill the values:
   ```ini
   # Used by Vite in the browser (see src/lib/supabase.ts and src/lib/gemini.ts)
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   VITE_GEMINI_API_KEY=
   ```

   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for authentication.
   - `VITE_GEMINI_API_KEY` enables AI analysis with Gemini. If omitted, the app falls back to a heuristic analyzer.

Note: Vite exposes environment variables prefixed with `VITE_` to the client.

## Scripts

Defined in `package.json`:

- `npm run dev` — Start the Vite dev server.
- `npm run build` — Build for production.
- `npm run preview` — Preview the production build locally.
- `npm run lint` — Run ESLint.

## Development

Start the dev server:

```bash
npm run dev
```

Then open the URL printed in your terminal (usually `http://localhost:5173`).

### Recommended workflow

- Keep `.env` up to date. The UI will warn in console if Supabase credentials are missing (see `src/lib/supabase.ts`).
- If Gemini is not configured, you can still exercise the analysis flow via the heuristic fallback (`analyzeResumeHeuristic` in `src/lib/gemini.ts`).
- Use TypeScript types in `src/types/` to maintain contract consistency across UI and analysis functions.

## Architecture

- **App State & Routing**: `src/App.tsx` implements a straightforward state-based navigator across: `landing`, `auth`, `dashboard`, `profile`. The header is hidden on the auth page.
- **Auth**: `src/contexts/AuthContext.tsx` wraps the app (`<AuthProvider>`) and exposes `user`, `loading`, and `signUp/signIn/signOut` functions. It listens to `supabase.auth.onAuthStateChange` and persists sessions when available.
- **Supabase Client**: `src/lib/supabase.ts` creates a client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. If these are missing, the client is `null` and calling auth methods will throw a helpful error.
- **AI Integration**: `src/lib/gemini.ts`
  - `analyzeResumeWithGemini(...)` and `analyzeMatchWithGemini(...)` call Gemini APIs and strictly parse outputs into well-defined TypeScript shapes with safety guards.
  - `analyzeResumeHeuristic(...)` provides an offline fallback that scores roles from a small role catalog and fills recommendations using `getCoursesForSkills`.
- **Courses**: `src/lib/courses.ts` maps common skills to reputable courses and providers.
- **UI**: Tailwind CSS for styling and a small UI layer in `src/components/ui/` (e.g., accessible `Button` with variants and loading state). Charts such as `src/components/charts/ClassicPieChart.tsx` render visual summaries.

## Supabase Setup Notes

1. Create a Supabase project at https://supabase.com/.
2. Go to Project Settings → API and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` public API key → `VITE_SUPABASE_ANON_KEY`
3. Paste them into your `.env` file. Restart the dev server if it was running.

The app currently relies on Supabase Auth for email/password sign-in and session persistence. If you add database reads/writes, define your tables and update `src/lib/database.types.ts` accordingly.

## AI (Gemini) Integration

- Obtain an API key from Google AI Studio and set `VITE_GEMINI_API_KEY`.
- When set, the app uses `gemini-1.5-flash-latest` for analysis via `generateContent` REST endpoints.
- Outputs are validated and coerced to safe defaults. If the response is not valid JSON, a recovery path attempts to extract the first JSON block.
- Without the key, the app uses a high-signal heuristic analyzer so the UX remains functional for demos.

## Styling

- Tailwind CSS is configured via `tailwind.config.js` and `postcss.config.js`.
- Global CSS in `src/index.css`.
- Utility function `cn` in `src/lib/utils.ts` can help compose class names.

## Linting

Run ESLint:

```bash
npm run lint
```

Additional configs: `@eslint/js`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` are set up in `devDependencies`.

## Build & Preview

```bash
npm run build
npm run preview
```

The preview server serves the production build locally for final checks.

## Deployment

Because this is a Vite SPA, you can deploy the `dist/` output to any static host (e.g., Netlify, Vercel, GitHub Pages). Ensure you set environment variables in your hosting platform (and expose them at build-time as `VITE_...`). For SSR or custom proxies, adjust `vite.config.ts` as needed.

## Troubleshooting

- **Supabase not configured**: You will see a console warning from `src/lib/supabase.ts` and authentication actions will throw `Supabase is not configured...`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
- **Gemini not configured**: You will see an error if calling Gemini functions directly. Either set `VITE_GEMINI_API_KEY` or use `analyzeResumeHeuristic(...)` for demos.
- **CORS or network errors**: Check your hosting environment or local dev proxy. Gemini calls are made from the browser; ensure the key and endpoint are correct.
- **Type errors**: Make sure your editor uses the workspace TypeScript version and that `src/types/` reflects the data you pass through components.

---

If you have suggestions or want to extend the project (e.g., add routing with React Router, persist analyses in Supabase tables, or integrate file uploads), feel free to contribute!
