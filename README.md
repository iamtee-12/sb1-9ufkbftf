# Overturn

Paste a Medicare Advantage denial notice → plain-English explanation, appeal deadline, evidence checklist and a ready-to-send reconsideration letter.
Runs 100% client-side (no data leaves the browser, no API key).

    npm install && npm run dev

Rules engine: `src/lib/analyze.ts`.

## Optional AI layer

`api/analyze.ts` is a serverless function (Vercel-style) that calls Claude and returns a tailored argument as structured JSON.
Set `ANTHROPIC_API_KEY` in the host's environment (never in client code). Without it the UI shows a notice and the rules-based letter keeps working.
Local test: `vercel dev`. Type-check: `npx tsc -p tsconfig.api.json`.

### Rate limiting (`api/_ratelimit.ts`)

| Env var | Default | Meaning |
|---|---|---|
| `ANTHROPIC_API_KEY` | – | Required for the AI step |
| `RATE_LIMIT_PER_HOUR` | 5 | AI requests per IP per hour |
| `DAILY_CAP` | 300 | Total AI requests per day, all users |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | – | Optional but recommended: shares counters across serverless instances. Without them limits are per-instance and can be bypassed. |

Also set a monthly spend limit in the Anthropic Console as a hard backstop.
