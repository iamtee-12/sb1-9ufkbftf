// Rate limiting for /api/analyze. Files starting with "_" are not deployed as routes.
// Shared limits across serverless instances need Upstash Redis (UPSTASH_REDIS_REST_URL / _TOKEN).
// Without it we fall back to per-instance memory: still useful, but a determined caller can get around it.

export interface LimitResult { ok: boolean; retryAfter: number; reason?: 'ip' | 'global' }

const num = (v: string | undefined, d: number) => (v && Number.isFinite(+v) && +v > 0 ? +v : d);
const PER_IP = () => num(process.env.RATE_LIMIT_PER_HOUR, 5);
const DAILY_CAP = () => num(process.env.DAILY_CAP, 300);

const mem = new Map<string, { count: number; reset: number }>();

function memHit(key: string, windowSec: number, now = Date.now()): { count: number; retryAfter: number } {
  if (mem.size > 5000) for (const [k, v] of mem) if (v.reset <= now) mem.delete(k);
  let e = mem.get(key);
  if (!e || e.reset <= now) {
    e = { count: 0, reset: now + windowSec * 1000 };
    mem.set(key, e);
  }
  e.count++;
  return { count: e.count, retryAfter: Math.max(1, Math.ceil((e.reset - now) / 1000)) };
}

async function redisHit(key: string, windowSec: number): Promise<{ count: number; retryAfter: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const r = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, windowSec, 'NX'], ['TTL', key]]),
    });
    if (!r.ok) return null;
    const out = (await r.json()) as { result: number }[];
    const ttl = out[2]?.result;
    return { count: out[0].result, retryAfter: ttl && ttl > 0 ? ttl : windowSec };
  } catch {
    return null; // Redis down: fall back to memory rather than open the gate
  }
}

async function hit(key: string, windowSec: number) {
  return (await redisHit(key, windowSec)) ?? memHit(key, windowSec);
}

export function clientIp(headers: Record<string, string | string[] | undefined>): string {
  const xff = headers['x-forwarded-for'];
  const first = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim();
  const real = headers['x-real-ip'];
  return first || (Array.isArray(real) ? real[0] : real) || 'unknown';
}

export async function checkLimit(ip: string): Promise<LimitResult> {
  const day = new Date().toISOString().slice(0, 10);
  // Per-IP first, so one abusive caller's blocked requests never eat the shared daily budget.
  const i = await hit(`overturn:ip:${ip}`, 3600);
  if (i.count > PER_IP()) return { ok: false, retryAfter: i.retryAfter, reason: 'ip' };
  const g = await hit(`overturn:global:${day}`, 86400);
  if (g.count > DAILY_CAP()) return { ok: false, retryAfter: g.retryAfter, reason: 'global' };
  return { ok: true, retryAfter: 0 };
}
