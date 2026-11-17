/**
 * Turn a brain dump into exactly three action items.
 *
 * With EXPO_PUBLIC_FLOW_API_URL set, the text is POSTed to your backend
 * (e.g. a Supabase Edge Function that calls the OpenAI API) which must
 * return `{ "actions": string[] }`. Never put an OpenAI key in the app.
 *
 * Without a backend, a small offline heuristic ranks the thoughts instead.
 */
export interface Distilled {
  actions: string[];
  source: 'ai' | 'offline';
}

const API_URL = process.env.EXPO_PUBLIC_FLOW_API_URL;

const URGENT = /\b(today|tonight|tomorrow|asap|urgent|deadline|due|overdue|before|by \w+day)\b/i;
const ACTION = /^(call|email|text|reply|send|pay|book|buy|submit|finish|fix|write|review|clean|plan|schedule|cancel|renew|apply|ship|prepare|draft|read|order|ask|follow up)\b/i;
const WORRY = /\b(worried|stress|anxious|feel|tired|maybe|someday|should probably)\b/i;

function splitThoughts(text: string) {
  return text
    .split(/\n|[.;!?]+|\s+-\s+|•/)
    .map((s) => s.trim().replace(/^(i need to|need to|i have to|have to|i should|must|gotta|remember to|don't forget to)\s+/i, ''))
    .filter((s) => s.length > 2);
}

export function distillOffline(text: string): string[] {
  const seen = new Set<string>();
  const thoughts = splitThoughts(text).filter((t) => {
    const k = t.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const scored = thoughts.map((t, i) => ({
    t,
    score: (URGENT.test(t) ? 3 : 0) + (ACTION.test(t) ? 2 : 0) - (WORRY.test(t) ? 2 : 0) - i * 0.01,
  }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ t }) => t.charAt(0).toUpperCase() + t.slice(1));
}

export async function distill(text: string): Promise<Distilled> {
  if (API_URL) {
    try {
      const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (res.ok) {
        const data = (await res.json()) as { actions?: unknown };
        if (Array.isArray(data.actions)) return { actions: data.actions.map(String).slice(0, 3), source: 'ai' };
      }
    } catch {
      /* fall through to offline */
    }
  }
  return { actions: distillOffline(text), source: 'offline' };
}
