import { useMemo, useState } from 'react';
import { Sparkles, ClipboardCopy, Download, FileText, Scale, ShieldCheck, CalendarClock, ListChecks, Check } from 'lucide-react';
import { analyze, buildLetter, SAMPLE, type Details, type AiResult } from './lib/analyze';

const empty: Details = { patient: '', insurer: '', claimNumber: '', memberId: '', service: '', provider: '', letterDate: '', extra: '', expedited: false };

const FIELDS: [Exclude<keyof Details, 'expedited'>, string][] = [
  ['patient', 'Patient name'],
  ['insurer', 'Medicare Advantage plan'],
  ['claimNumber', 'Claim number'],
  ['memberId', 'Plan member ID'],
  ['service', 'Service / treatment'],
  ['provider', 'Provider'],
];

export default function App() {
  const [text, setText] = useState('');
  const [d, setD] = useState<Details>(empty);
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ai, setAi] = useState<AiResult | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');

  const runAi = async () => {
    setAiBusy(true);
    setAiError('');
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, extra: d.extra }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || 'AI is unavailable right now');
      setAi(body as AiResult);
      setEdited(null);
    } catch (e) {
      setAiError((e instanceof Error ? e.message : 'AI is unavailable') + '. The standard letter below still works.');
    } finally {
      setAiBusy(false);
    }
  };

  const analysis = useMemo(() => (text.trim().length > 20 ? analyze(text, d.letterDate) : null), [text, d.letterDate]);

  // fill blanks with details extracted from the pasted letter
  const merged: Details = useMemo(() => {
    const x = analysis?.extracted ?? {};
    return {
      ...d,
      patient: d.patient || x.patient || '',
      insurer: d.insurer || x.insurer || '',
      claimNumber: d.claimNumber || x.claimNumber || '',
      memberId: d.memberId || x.memberId || '',
    };
  }, [d, analysis]);

  const letter = useMemo(() => (analysis ? edited ?? buildLetter(merged, analysis, new Date(), ai?.argument) : ''), [analysis, merged, edited, ai]);
  const daysLeft = analysis?.deadlineDate ? Math.ceil((analysis.deadlineDate.getTime() - Date.now()) / 86400000) : null;

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([letter], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insurance-appeal-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold"><Scale size={22} /> Overturn</div>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">Medicare Advantage denied your care? Appeal in 2 minutes.</h1>
          <p className="mt-3 text-slate-300 max-w-2xl">
            Only about 12% of Medicare Advantage denials are ever appealed, yet about 82% of those appeals are overturned in whole or in part
            (<a className="underline" href="https://www.kff.org/patient-consumer-protections/prior-authorization-metrics-provide-new-insights-into-insurer-practices-but-gaps-remain/">KFF, 2023 data</a>).
            Paste your denial notice and get a plain-English explanation, your deadline, and a ready-to-send reconsideration letter.
          </p>
          <p className="mt-3 text-sm text-emerald-300 flex items-center gap-1"><ShieldCheck size={16} /> Private by default: the letter builder runs in your browser. The optional AI step asks first.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold flex items-center gap-2"><FileText size={18} /> 1. Paste your denial notice</h2>
            <button className="text-sm text-emerald-700 underline" onClick={() => { setText(SAMPLE); setEdited(null); setAi(null); }}>Try a sample</button>
          </div>
          <textarea
            className="w-full h-48 border rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Paste the text of the denial notice (Integrated Denial Notice / Notice of Denial of Medical Coverage) here…"
            value={text}
            onChange={e => { setText(e.target.value); setEdited(null); setAi(null); }}
          />
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            {FIELDS.map(([k, label]) => (
              <label key={k} className="text-xs text-slate-500">
                {label}
                <input
                  className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm text-slate-800"
                  value={d[k]}
                  placeholder={merged[k] && !d[k] ? merged[k] : ''}
                  onChange={e => { setD({ ...d, [k]: e.target.value }); setEdited(null); }}
                />
              </label>
            ))}
            <label className="text-xs text-slate-500">
              Date on denial notice
              <input type="date" className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm text-slate-800" value={d.letterDate}
                onChange={e => { setD({ ...d, letterDate: e.target.value }); setEdited(null); }} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm mt-3">
            <input type="checkbox" checked={d.expedited} onChange={e => { setD({ ...d, expedited: e.target.checked }); setEdited(null); }} />
            Waiting could seriously harm my health: request a fast (72-hour) decision
          </label>
          <label className="text-xs text-slate-500 block mt-3">
            Anything else that supports your case (what your doctor said, treatments already tried…)
            <textarea className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm text-slate-800 h-16" value={d.extra}
              onChange={e => { setD({ ...d, extra: e.target.value }); setEdited(null); }} />
          </label>
        </section>

        {analysis && (
          <>
            <section className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold flex items-center gap-2"><Sparkles size={18} /> Tailor with AI (optional)</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    Claude reads your notice and writes an argument specific to it. This sends the notice text to our server and to Anthropic to generate the result.
                    Remove names and ID numbers first if you prefer. Nothing is stored.
                  </p>
                </div>
                <button onClick={runAi} disabled={aiBusy} className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm disabled:opacity-50">
                  {aiBusy ? 'Reading your notice…' : ai ? 'Run again' : 'Tailor my letter'}
                </button>
              </div>
              {aiError && <p className="text-sm text-amber-700 mt-3">{aiError}</p>}
              {ai && (
                <div className="mt-4 text-sm space-y-3">
                  <p>{ai.summary}</p>
                  {ai.questions_for_user.length > 0 && (
                    <div>
                      <h3 className="font-medium">Strengthen your case</h3>
                      <ul className="list-disc pl-5 space-y-1 mt-1">{ai.questions_for_user.map(q => <li key={q}>{q}</li>)}</ul>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">AI-written text can contain mistakes. Read the letter, fill the [brackets], and confirm facts and dates before sending.</p>
                </div>
              )}
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <h2 className="font-semibold flex items-center gap-2"><Scale size={18} /> What it means</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(analysis.matches.length ? analysis.matches : [analysis.primary]).map(r => (
                    <span key={r.kind} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">{r.title}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed">{analysis.primary.plain}</p>
                <h3 className="font-medium mt-4 text-sm">What to do</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
                  {analysis.primary.strategy.map(s => <li key={s}>{s}</li>)}
                </ul>
              </div>
              <div className="space-y-6">
                <div className={`rounded-xl border p-5 ${daysLeft !== null && daysLeft < 30 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                  <h2 className="font-semibold flex items-center gap-2"><CalendarClock size={18} /> Your deadline</h2>
                  {(analysis.primary.kind === 'services_ending' || ai?.urgent) ? (
                    <p className="mt-2 text-sm text-red-700 font-medium">
                      URGENT: for ending rehab / skilled nursing / home health, call the QIO number on your notice by noon the day before coverage ends. Do not wait to send a letter.
                    </p>
                  ) : analysis.deadlineDate ? (
                    <p className="mt-2 text-sm">
                      Appeal by <b>{analysis.deadlineDate.toLocaleDateString('en-US', { dateStyle: 'long' })}</b>
                      {daysLeft !== null && <> — {daysLeft >= 0 ? `${daysLeft} days left` : 'this date has passed: appeal anyway and ask for a good-cause exception'}</>}
                      <span className="block text-slate-500 text-xs mt-1">Based on {analysis.deadlineDays} days from the letter date. Confirm against your letter.</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm">Enter the date on your letter above. Medicare Advantage gives you <b>60 days</b> from the notice date to request a reconsideration.</p>
                  )}
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h2 className="font-semibold flex items-center gap-2"><ListChecks size={18} /> Evidence to attach</h2>
                  <ul className="mt-2 text-sm space-y-1">
                    {[...new Set((analysis.matches.length ? analysis.matches : [analysis.primary]).flatMap(r => r.evidence))].map(e => (
                      <li key={e}><label className="flex gap-2"><input type="checkbox" className="mt-1" /> {e}</label></li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h2 className="font-semibold flex items-center gap-2"><FileText size={18} /> Your reconsideration request (editable)</h2>
                <div className="flex gap-2">
                  <button onClick={copy} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm">
                    {copied ? <Check size={16} /> : <ClipboardCopy size={16} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={download} className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm"><Download size={16} /> Download</button>
                </div>
              </div>
              <textarea className="w-full h-[28rem] border rounded-lg p-3 text-sm font-mono" value={letter} onChange={e => setEdited(e.target.value)} />
              <p className="text-xs text-slate-500 mt-2">
                Fill any [bracketed] blanks, send by certified mail, fax or the plan's portal, and keep proof. If the plan upholds its denial it must forward your case to an independent reviewer (the IRE) automatically. For urgent cases, also call 1-800-MEDICARE or your State Health Insurance Assistance Program (SHIP) for free help. Overturn is an information tool, not legal or medical advice.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
