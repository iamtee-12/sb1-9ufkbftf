# Overturn

Paste a Medicare Advantage denial notice → plain-English explanation, appeal deadline, evidence checklist and a ready-to-send reconsideration letter.
Runs 100% client-side (no data leaves the browser, no API key).

    npm install && npm run dev

Rules engine: `src/lib/analyze.ts`.

## Optional AI layer

`api/analyze.ts` is a serverless function (Vercel-style) that calls Claude and returns a tailored argument as structured JSON.
Set `ANTHROPIC_API_KEY` in the host's environment (never in client code). Without it the UI shows a notice and the rules-based letter keeps working.
Local test: `vercel dev`. Type-check: `npx tsc -p tsconfig.api.json`.
