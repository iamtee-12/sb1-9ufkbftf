import { useMemo, useState } from 'react';
import { ClipboardCopy, Download, FileText, Scale, ShieldCheck, CalendarClock, ListChecks, Check } from 'lucide-react';
import { analyze, buildLetter, SAMPLE, type Details } from './lib/analyze';

const empty: Details = { patient: '', insurer: '', claimNumber: '', memberId: '', service: '', provider: '', letterDate: '', extra: '' };

const FIELDS: [keyof Details, string][] = [
  ['patient', 'Patient name'],
  ['insurer', 'Insurance company'],
  ['claimNumber', 'Claim number'],
  ['memberId', 'Member ID'],
  ['service', 'Service / treatment'],
  ['provider', 'Provider'],
];

export default function App() {
  const [text, setText] = useState('');
  const [d, setD] = useState<Details>(empty);
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const letter = useMemo(() => (analysis ? edited ?? buildLetter(merged, analysis) : ''), [analysis, merged, edited]);
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
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">Insurance denied your claim? Fight back in 2 minutes.</h1>
          <p className="mt-3 text-slate-300 max-w-2xl">
            Fewer than 1% of denied claims are ever appealed, yet about 44% of appeals on HealthCare.gov plans are overturned
            (<a className="underline" href="https://www.kff.org/private-insurance/claims-denials-and-appeals-in-aca-marketplace-plans-in-2023/">KFF</a>).
            Paste your denial letter and get a plain-English explanation, your deadline, and a ready-to-send appeal letter.
          </p>
          <p className="mt-3 text-sm text-emerald-300 flex items-center gap-1"><ShieldCheck size={16} /> Private: everything runs in your browser. Nothing is uploaded.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold flex items-center gap-2"><FileText size={18} /> 1. Paste your denial letter</h2>
            <button className="text-sm text-emerald-700 underline" onClick={() => { setText(SAMPLE); setEdited(null); }}>Try a sample</button>
          </div>
          <textarea
            className="w-full h-48 border rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Paste the text of the denial letter or Explanation of Benefits here…"
            value={text}
            onChange={e => { setText(e.target.value); setEdited(null); }}
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
              Date on denial letter
              <input type="date" className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm text-slate-800" value={d.letterDate}
                onChange={e => { setD({ ...d, letterDate: e.target.value }); setEdited(null); }} />
            </label>
          </div>
          <label className="text-xs text-slate-500 block mt-3">
            Anything else that supports your case (what your doctor said, treatments already tried…)
            <textarea className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm text-slate-800 h-16" value={d.extra}
              onChange={e => { setD({ ...d, extra: e.target.value }); setEdited(null); }} />
          </label>
        </section>

        {analysis && (
          <>
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
                  {analysis.deadlineDate ? (
                    <p className="mt-2 text-sm">
                      Appeal by <b>{analysis.deadlineDate.toLocaleDateString('en-US', { dateStyle: 'long' })}</b>
                      {daysLeft !== null && <> — {daysLeft >= 0 ? `${daysLeft} days left` : 'this date has passed: appeal anyway and ask for a good-cause exception'}</>}
                      <span className="block text-slate-500 text-xs mt-1">Based on {analysis.deadlineDays} days from the letter date. Confirm against your letter.</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm">Enter the date on your letter above. Most plans give <b>180 days</b> to file an internal appeal.</p>
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
                <h2 className="font-semibold flex items-center gap-2"><FileText size={18} /> Your appeal letter (editable)</h2>
                <div className="flex gap-2">
                  <button onClick={copy} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm">
                    {copied ? <Check size={16} /> : <ClipboardCopy size={16} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={download} className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm"><Download size={16} /> Download</button>
                </div>
              </div>
              <textarea className="w-full h-[28rem] border rounded-lg p-3 text-sm font-mono" value={letter} onChange={e => setEdited(e.target.value)} />
              <p className="text-xs text-slate-500 mt-2">
                Fill any [bracketed] blanks, send by certified mail or the insurer's portal, and keep a copy. If the internal appeal fails, most plans
                give you the right to a free independent external review. Overturn is an information tool, not legal or medical advice.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
