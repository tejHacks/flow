# Flow

> Empty your head. Leave with three things to do.

## What's built

- Brain-dump screen → **three action items** with checkboxes, history saved
- `src/lib/distill.ts`: calls your backend when `EXPO_PUBLIC_FLOW_API_URL` is set, otherwise an **offline heuristic** ranks urgent, actionable thoughts
- **Box-breathing timer** (4-4-4-4, four rounds) with haptics

## Next

- Create a Supabase Edge Function that calls the OpenAI API and returns `{ "actions": string[] }` — keep the API key on the server, never in the app (see `.env.example`).
- Add Supabase auth + sync, and RevenueCat for subscriptions.

## Run it

```bash
npm install          # already done once after scaffolding
npx expo start       # then press i (iOS), a (Android) or w (web)
npm run typecheck
npx expo lint
```

Built on **Expo SDK 58** (React Native 0.88, React 19.3), Expo Router, TypeScript.
Everything is stored on-device with AsyncStorage (`src/lib/storage.ts`); there is no backend yet.

## Structure

- `src/app/` — screens (Expo Router; every file is a route)
- `src/brand.ts` — app name, brand colours, screen titles
- `src/theme.ts` — light/dark design tokens
- `src/components/ui.tsx` — shared UI primitives
