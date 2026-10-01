export type DenialKind =
  | 'medical_necessity'
  | 'prior_auth'
  | 'out_of_network'
  | 'excluded'
  | 'experimental'
  | 'services_ending'
  | 'coding'
  | 'duplicate'
  | 'timely_filing'
  | 'unknown';

export interface Details {
  patient: string;
  insurer: string;
  claimNumber: string;
  memberId: string;
  service: string;
  provider: string;
  letterDate: string; // yyyy-mm-dd
  extra: string; // user's own facts, e.g. doctor's reasoning
  expedited: boolean;
}

interface Rule {
  kind: DenialKind;
  title: string;
  patterns: RegExp[];
  plain: string;
  strategy: string[];
  evidence: string[];
  argument: string;
}

const RULES: Rule[] = [
  {
    kind: 'medical_necessity',
    title: 'Not medically necessary',
    patterns: [/medical(ly)? necess/i, /not necessary/i, /does not meet (the )?(criteria|guidelines)/i, /clinical criteria/i],
    plain:
      'The insurer decided the care was not needed for your condition under its own guidelines. This is the most overturned type of denial because a doctor\'s opinion can directly contradict it.',
    strategy: [
      'Ask your doctor for a letter of medical necessity explaining why this treatment, for you, specifically.',
      'Request the exact clinical criteria the insurer used. You are entitled to it, free of charge.',
      'Point out any treatments you already tried that failed.',
      'Ask that the appeal be reviewed by a physician in the same specialty.',
      'Cite Traditional Medicare coverage rules (NCDs/LCDs): since 2024 Medicare Advantage plans must follow them and cannot add stricter internal criteria.',
    ],
    evidence: ['Letter of medical necessity from your treating doctor', 'Chart notes and test results supporting the diagnosis', 'Records of prior treatments tried', 'Published guidelines or studies supporting the treatment'],
    argument:
      'The service was medically necessary for my condition. Under 42 CFR 422.101(b), a Medicare Advantage plan must apply Traditional Medicare coverage criteria and may not use internal criteria that are more restrictive. My treating physician determined it was appropriate after considering my history and prior treatments. I request the clinical criteria relied upon and review by a physician in the same or similar specialty.',
  },
  {
    kind: 'prior_auth',
    title: 'Missing prior authorization',
    patterns: [/prior auth/i, /pre-?auth/i, /pre-?certif/i, /authorization (was )?(not|required|missing)/i, /no authorization/i],
    plain:
      'The insurer says approval was required before the service and was not on file. Often the provider was supposed to get it, and the mistake is theirs, not yours.',
    strategy: [
      'Call the provider\'s billing office: ask whether authorization was requested, and when.',
      'If it was an emergency or urgent, say so: emergency care cannot be denied for lack of prior authorization on most plans.',
      'Ask the provider to request a retroactive authorization.',
      'Ask the insurer for a call log or reference number of any authorization attempt.',
    ],
    evidence: ['Provider\'s authorization request or confirmation number', 'Proof the care was urgent or emergency', 'Referral from your primary doctor', 'Names, dates and reference numbers from phone calls'],
    argument:
      'Prior authorization was either obtained by my provider or was not reasonably within my control to obtain. If the care was urgent or emergent, authorization should not have been required. I request retroactive authorization and reprocessing of the claim.',
  },
  {
    kind: 'out_of_network',
    title: 'Out-of-network provider',
    patterns: [/out[- ]of[- ]network/i, /non-?participating/i, /not (a )?(contracted|in[- ]network)/i],
    plain:
      'The insurer paid little or nothing because the provider is not in its network. Exceptions exist: emergencies, care at an in-network facility, or no in-network option nearby.',
    strategy: [
      'Check whether it was an emergency or whether you were treated by an out-of-network clinician at an in-network hospital. Medicare Advantage plans must cover emergency and urgently needed care out of network.',
      'If no in-network provider could treat you in time or nearby, request a network gap exception.',
      'Ask whether the provider was listed as in-network in the insurer\'s directory when you booked.',
    ],
    evidence: ['Screenshot or record of the provider directory listing', 'Proof of emergency or facility context', 'Evidence no in-network provider was available'],
    argument:
      'This care should be processed at in-network cost-sharing because it was emergency or facility-based care, or because no in-network provider was reasonably available. I request reprocessing under Medicare Advantage rules requiring coverage of emergency and urgently needed services regardless of network status.',
  },
  {
    kind: 'services_ending',
    title: 'Services ending (rehab, SNF, home health)',
    patterns: [/non-?coverage/i, /skilled nursing/i, /home health/i, /rehab(ilitation)?\b/i, /(coverage|services) (will )?end/i, /last covered day/i, /discharge/i],
    plain:
      'The plan says your rehab, skilled nursing or home health coverage is ending. This one is URGENT: you can ask for a fast appeal to an independent reviewer (the QIO) and usually have to call by noon of the day before coverage ends. You can keep receiving care while it is reviewed.',
    strategy: [
      'Call the Quality Improvement Organization (QIO) number on your Notice of Medicare Non-Coverage NOW. The deadline is usually noon the day before services end.',
      'Ask your therapist or doctor to document why you still need skilled care and cannot safely be discharged.',
      'You do not need to prove this yourself on the call: just say you want a fast appeal.',
    ],
    evidence: ['Notice of Medicare Non-Coverage', 'Therapy or nursing notes showing ongoing skilled need', 'Doctor statement that stopping care is unsafe'],
    argument:
      'I request an expedited review. Continued skilled care remains medically necessary and it is not safe for me to be discharged or have services stopped at this time. Under Traditional Medicare coverage rules, improvement is not required for coverage; skilled care needed to maintain my condition or prevent decline is covered.',
  },
  {
    kind: 'excluded',
    title: 'Not a covered benefit',
    patterns: [/not a covered/i, /exclu(ded|sion)/i, /not covered/i, /benefit (limit|maximum)/i, /plan does not (cover|provide)/i],
    plain:
      'The insurer says your plan does not cover this service or you hit a limit. Check the exact wording in your plan documents. The insurer must cite the specific clause.',
    strategy: [
      'Request the specific plan provision relied upon, in writing.',
      'Read your Summary of Benefits: exclusions are often narrower than the denial implies.',
      'Argue the service is part of a covered category (for example treatment of a covered condition, not cosmetic).',
      'Compare against Traditional Medicare: Medicare Advantage plans must cover everything Original Medicare covers.',
    ],
    evidence: ['Your Summary of Benefits and Coverage / plan booklet', 'Doctor\'s note showing the service treats a covered condition', 'Any marketing or website text promising the coverage'],
    argument:
      'The service falls within my plan\'s covered benefits as it treats a covered medical condition. I request the specific plan language relied upon for this denial and reconsideration under the plan terms and applicable law.',
  },
  {
    kind: 'experimental',
    title: 'Experimental or investigational',
    patterns: [/experimental/i, /investigational/i, /unproven/i],
    plain:
      'The insurer treats the treatment as not yet proven. Published studies and specialist guidelines are your best evidence here.',
    strategy: [
      'Gather peer-reviewed studies and professional society guidelines supporting the treatment.',
      'Ask your doctor to explain why standard treatments are not suitable.',
      'Plan on an external review: independent reviewers frequently overturn these.',
    ],
    evidence: ['Peer-reviewed studies', 'Specialty society guidelines', 'Doctor\'s letter on why standard options are inadequate', 'FDA approval or clearance for the use'],
    argument:
      'The treatment is supported by peer-reviewed evidence and accepted by relevant medical specialty guidelines, and standard alternatives are not appropriate for me. I request reconsideration and independent external review if upheld.',
  },
  {
    kind: 'coding',
    title: 'Billing or coding error',
    patterns: [/\bcpt\b/i, /coding/i, /modifier/i, /bundl/i, /incorrect (code|diagnosis)/i, /diagnosis code/i, /unbundl/i],
    plain:
      'Something in how the bill was coded does not match what the insurer expected. These are usually clerical and fixable by the provider, with no argument needed.',
    strategy: [
      'Ask the provider\'s billing office to review and resubmit a corrected claim.',
      'Request an itemized bill and compare it with your Explanation of Benefits.',
      'Only appeal formally if the provider confirms the codes are correct.',
    ],
    evidence: ['Itemized bill', 'Explanation of Benefits', 'Corrected claim from provider'],
    argument:
      'The denial appears to stem from a coding or billing issue rather than a coverage determination. I ask that the claim be reprocessed with corrected information submitted by my provider.',
  },
  {
    kind: 'duplicate',
    title: 'Duplicate claim',
    patterns: [/duplicate/i, /already (been )?(processed|paid|adjudicated)/i],
    plain: 'The insurer thinks this claim was already handled. Often a harmless resubmission, sometimes a real error.',
    strategy: ['Check whether an earlier claim for the same date was paid.', 'If not, show the two claims are for different services or dates.'],
    evidence: ['Both Explanations of Benefits', 'Itemized bill showing distinct services'],
    argument: 'This claim is not a duplicate: it covers a distinct service or date of service. I request it be reviewed on its own merits.',
  },
  {
    kind: 'timely_filing',
    title: 'Filed too late',
    patterns: [/timely filing/i, /filed (after|late|beyond)/i, /filing (limit|deadline)/i, /time limit for (filing|submission)/i],
    plain: 'The insurer says the claim arrived after its deadline. Proof of earlier submission, or provider error, can reverse this.',
    strategy: ['Ask the provider for proof of the original submission date (clearinghouse receipt).', 'Show any good-cause reason for delay.'],
    evidence: ['Clearinghouse or fax confirmation', 'Earlier rejection notices', 'Correspondence showing timely attempts'],
    argument: 'The claim was submitted within the filing deadline, or the delay was outside my control. Enclosed is proof of the original submission. I request reconsideration.',
  },
];

const UNKNOWN: Rule = {
  kind: 'unknown',
  title: 'Reason unclear',
  patterns: [],
  plain:
    'We could not identify a standard denial reason in this text. The letter must still state a specific reason. Ask the insurer for it in writing, and appeal anyway to preserve your rights.',
  strategy: ['Call the insurer and ask for the specific reason and the plan provision cited, in writing.', 'File an appeal before the deadline regardless.'],
  evidence: ['Denial letter and Explanation of Benefits', 'Medical records for this service'],
  argument: 'I disagree with this determination and request a full review. Please provide the specific reason and plan provision relied upon, along with the claim file.',
};

export interface Analysis {
  matches: Rule[];
  primary: Rule;
  deadlineDays: number;
  deadlineDate: Date | null;
  extracted: Partial<Details>;
}

function pick(text: string, res: RegExp[]): string {
  for (const re of res) {
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function analyze(text: string, letterDate: string): Analysis {
  const matches = RULES.filter(r => r.patterns.some(p => p.test(text)));
  const primary = matches[0] ?? UNKNOWN;

  const daysMatch = text.match(/(?:within|no later than|in)\s+(\d{2,3})\s*(?:calendar\s+)?days/i);
  let deadlineDays: number | null = null;
  if (daysMatch) {
    const n = parseInt(daysMatch[1], 10);
    if (n >= 1 && n <= 365) deadlineDays = n;
  }
  const effectiveDays = deadlineDays ?? 60; // Medicare Advantage: 60 calendar days from the notice date
  const base = parseDate(letterDate) ?? parseDate(
    pick(text, [/(?:date|dated)[:\s]+([A-Za-z]+ \d{1,2},? \d{4})/i, /(?:date|dated)[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i]),
  );
  const deadlineDate = base ? new Date(base.getTime() + effectiveDays * 86400000) : null;

  const extracted: Partial<Details> = {
    claimNumber: pick(text, [/claim\s*(?:#|no\.?|number)[:\s]*([A-Z0-9-]{5,})/i]),
    memberId: pick(text, [/(?:member|subscriber|policy|id)\s*(?:#|no\.?|number|id)[:\s]*([A-Z0-9-]{5,})/i]),
    patient: pick(text, [/\b(?:Patient|Member name|Re|Dear)[:,]?\s+([A-Z][a-z]+(?: [A-Z][a-z.]+){1,2})/]),
    insurer: (text.split('\n').map(l => l.trim()).find(Boolean) ?? '').slice(0, 60).replace(/^(date|re)\b.*/i, ''),
  };
  return { matches, primary, deadlineDays: effectiveDays, deadlineDate, extracted };
}

export function buildLetter(d: Details, a: Analysis, today = new Date()): string {
  const fmt = (x: Date) => x.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const blank = (v: string, label: string) => v.trim() || `[${label}]`;
  const reasons = (a.matches.length ? a.matches : [a.primary]);
  const body = reasons.map(r => r.argument).join('\n\n');
  const original = d.letterDate ? parseDate(d.letterDate) : null;
  return `${fmt(today)}

${blank(d.insurer, 'Insurance company name')}
Attn: Appeals and Grievances Department

RE: Request for reconsideration of Medicare Advantage denial
Patient: ${blank(d.patient, 'Patient name')}
Medicare Advantage member ID: ${blank(d.memberId, 'Member ID')}
Claim number: ${blank(d.claimNumber, 'Claim number')}
Service: ${blank(d.service, 'Service or treatment')}
Provider: ${blank(d.provider, 'Provider name')}
${original ? `Date of denial letter: ${fmt(original)}\n` : ''}
To the Appeals and Grievances Department:

I am writing to request reconsideration of the denial referenced above, under my rights as a Medicare Advantage enrollee. I request a full and fair review of this decision.

${body}
${d.extra.trim() ? `\nAdditional information:\n${d.extra.trim()}\n` : ''}
I also request, free of charge, copies of all documents, records and criteria relied upon in making this determination, including the clinical guidelines used and the credentials of the reviewer. ${d.expedited ? 'I request an EXPEDITED (72-hour) reconsideration. My physician has indicated, or I believe, that applying the standard timeframe could seriously jeopardize my life, health, or ability to regain maximum function.\n\n' : ''}If this denial is upheld in whole or in part, I understand the plan must forward my case to the Independent Review Entity, and I request that this be done without delay.

Enclosed:
${[...new Set(reasons.flatMap(r => r.evidence))].map(e => `  - ${e}`).join('\n')}

Please confirm receipt of this appeal in writing and send your decision to the address on file.

Sincerely,

${blank(d.patient, 'Patient name')}
[Phone] | [Address]
`;
}

export const SAMPLE = `Acme Medicare Advantage Plan (HMO)
Date: September 3, 2026

Re: Jane Doe
Member ID: AHP-882310044
Claim number: CLM-2026-554821

Dear Jane Doe,

We have reviewed the claim for an MRI of the lumbar spine performed by Riverside Imaging on August 12, 2026. We have denied this claim because the service does not meet our clinical criteria for medical necessity. Additionally, prior authorization was not obtained before the service.

If you disagree with this decision you may request a reconsideration within 60 calendar days of the date of this notice.`;
