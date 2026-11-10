import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/* =====================================================================
   SETTINGS (speed)
   ===================================================================== */
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const PARALLEL_CALLS = 2;      // ek saath 2 calls, jo pehle sahi aaye wahi use hoga
const MAX_ROUNDS = 2;          // sab fail hone par sirf ek aur round
const CALL_TIMEOUT_MS = 12000; // Gemini 12 sec me na de to cancel
const MAX_OUTPUT_TOKENS = 300;
const HISTORY_SIZE = 60;       // server par yaad rakhe gaye pichhle reviews

/* =====================================================================
   BUSINESS PACK (Dr. Kanika Gupta - Gynecologist)
   ===================================================================== */
const OWNER_NAME = process.env.OWNER_NAME || 'Dr. Kanika Gupta';
const PRODUCT_WORD = 'consultation';

// Doctor's Treatments / Specializations (weighted for variety)
const TREATMENT_SERIES = [
  { n: 'Pregnancy Care', w: 8, variants: [['Pregnancy Checkup', 3], ['High Risk Pregnancy', 2], ['Normal Delivery', 2]] },
  { n: 'Gynecology Issues', w: 7, variants: [['PCOS treatment', 3], ['Menstrual Problems', 3], ['White Discharge issue', 2]] },
  { n: 'Fertility & Planning', w: 5, variants: [['Infertility treatment', 3], ['Family Planning', 2], ['Copper-T insertion', 2]] },
  { n: 'General Consult', w: 4, variants: [['Routine checkup', 3], ['Nutritional Counseling', 2]] },
];

const SEO_KEYWORDS = [
  'best gynecologist in Yamuna Vihar',
  'lady doctor near me',
  'PCOS treatment in Delhi',
  'pregnancy doctor in Yamuna Vihar',
  'best female doctor for pregnancy',
  'Dr Kanika Gupta Yamuna Vihar',
  'infertility specialist in Delhi',
  'top gynecologist in North East Delhi',
  'safe abortion and family planning',
  'high risk pregnancy doctor Yamuna Vihar',
];

// Topics: id, prompt text, aur check regex
const TOPICS = {
  location: {
    id: 'location',
    text: 'the location: easy to find in Block B, Yamuna Vihar, convenient to reach',
    must: /yamuna vihar|location|jagah|rasta|nazdik|paas|easy to find|aasani|block/i,
  },
  politeness: {
    id: 'politeness',
    text: 'the behavior of Dr. Kanika: very polite, patient listener, makes you feel comfortable, explains everything calmly',
    must: /behavior|nature|polite|patient|listen|sunti|samjhati|comfortable|friendly|mam|doctor/i,
  },
  treatment: {
    id: 'treatment',
    text: 'effective treatment: the diagnosis was accurate, medicines worked perfectly, and health improved',
    must: /treatment|medicines|dawai|fayda|aram|diagnosis|effective|farq|health/i,
  },
  clinic: {
    id: 'clinic',
    text: 'the clinic hygiene: very clean, well-maintained, hygienic environment, good staff',
    must: /clinic|clean|hygiene|safai|saaf|staff|maintained|environment/i,
  },
  waiting: {
    id: 'waiting',
    text: 'waiting time: well managed appointments, less waiting time, quick and smooth process',
    must: /waiting|time|appointment|manage|jaldi|bheed|smooth|number/i,
  },
  trust: {
    id: 'trust',
    text: 'trust and experience: highly experienced doctor, felt safe and in good hands, genuine advice',
    must: /trust|experience|bharosa|safe|expert|genuine|advice|salah|hath/i,
  },
  specialty: {
    id: 'specialty',
    text: 'specialized care: receiving great care for specific issues like pregnancy or PCOS',
    must: /pregnancy|pcos|period|issue|problem|care|baby|delivery/i,
  },
};

const ALL_TOPICS = ['location', 'politeness', 'treatment', 'clinic', 'waiting', 'trust', 'specialty'];

// Chips = keywords patient clicks
const CHIPS = {
  'Friendly Doctor': { id: 'chip_friendly', text: 'Dr. Kanika is very friendly, patient, and listens carefully to all problems', must: /friendly|polite|nature|listen|sunti|samjhati|mam/i },
  'Effective Treatment': { id: 'chip_treatment', text: 'the treatment and medicines were very effective and gave quick relief', must: /treatment|medicine|dawai|fayda|aram|effective|result/i },
  'Clean Clinic': { id: 'chip_clinic', text: 'the clinic is very clean, hygienic, and safe', must: /clean|hygiene|safai|saaf|clinic/i },
  'PCOS & Pregnancy': { id: 'chip_specialty', text: 'she provides excellent care for pregnancy and PCOS related issues', must: /pregnancy|pcos|period|baby|care|maternity/i },
  'Less Waiting Time': { id: 'chip_waiting', text: 'appointments are well managed with very less waiting time', must: /waiting|time|appointment|jaldi/i },
  'Trusted Specialist': { id: 'chip_trust', text: 'she is a highly trusted and experienced specialist, gave genuine advice', must: /trust|experience|expert|bharosa|genuine|advice|safe/i },
  'Yamuna Vihar': { id: 'chip_location', text: 'the clinic location in Yamuna Vihar is very accessible', must: /yamuna vihar|location|block|nazdik/i },
};

// Patient Personas
const PERSONAS = [
  { id: 'pregnant_lady', text: 'a pregnant woman visiting for checkups, feels cared for and safe, warm tone' },
  { id: 'husband', text: 'a husband reviewing on behalf of his wife, practical, grateful for the good treatment and safe delivery/care' },
  { id: 'young_girl', text: 'a young woman who visited for PCOS or menstrual issues, relieved to find a friendly and non-judgmental doctor' },
  { id: 'family_person', text: 'a middle-class family person, appreciates the genuine advice without unnecessary tests' },
  { id: 'professional', text: 'an educated working woman, values the doctor\'s high qualifications (MAMC/Max) and clean clinic' },
  { id: 'firsttimer', text: 'someone visiting a gynecologist for the first time, was nervous but the doctor made her feel completely comfortable' },
  { id: 'local_resident', text: 'a local Yamuna Vihar resident, happy to have such a good specialist nearby, simple language' },
  { id: 'mother', text: 'a mother who brought her teenage daughter for a checkup, very satisfied with how the doctor explained things' },
];

const WRITING_STYLES = [
  'neat spelling and proper grammar',
  'casual WhatsApp-style typing, relaxed',
  'all small letters, casual typing, no capital letters',
  'simple and slightly rough, one tiny spelling slip is fine',
];

const HINGLISH_LEVELS = [
  'mostly Hindi words, only a few English words like doctor, treatment, clinic, medicine',
  'half Hindi, half English words',
  'Hindi grammar but many common English words mixed in',
];

const OPENERS = [
  'start with the main health issue or reason for visit',
  'start with how the doctor behaved',
  'start with how you feel after the treatment',
  'start with the clinic and staff',
  'start in the middle of a thought, casually',
  'start by saying how you found Dr. Kanika',
  'start with your plain verdict in your own words',
  'start with a simple statement about the whole experience',
];

const ENDINGS = [
  'end with a small thanks or blessing to mam',
  'end by highly recommending her to other women',
  'end by saying you will always consult her in the future',
  'end with a short plain remark about the relief you got',
  'just stop naturally after your last point, no wrap-up line',
];

const BUYER_LINES = [
  'You visited for yourself.',
  'You visited for your wife.',
  'You visited for your daughter.',
  'You visited during your pregnancy.',
];

const EXAMPLES = {
  ENGLISH: [
    'Visited Dr Kanika for my pregnancy checkups, she is very polite and listens to all queries patiently, highly recommend her.',
    'Best gynecologist in Yamuna Vihar, the clinic is very clean and the treatment was very effective for my PCOS issue.',
    'She gives genuine advice and does not prescribe unnecessary tests, felt very comfortable talking to her.',
    'Appointments are managed well so waiting time is less, medicines worked perfectly for my wife.',
  ],
  HINGLISH: [
    'mam ka nature bahut accha hai, saari problem aaram se sunti hain aur samjhati hain, main apni wife ko yahi laata hu.',
    'PCOS ki problem ke liye dikhaya tha, unki dawai se bahut fayda hua, Yamuna vihar me sabse best doctor hain.',
    'clinic me safai bahut acchi hai aur staff bhi helpful hai, mam ne checkup bahut acche se kiya.',
    'unhone unnecessary test nahi likhe, genuine advice di, ab meri health me kaafi sudhar hai.',
  ],
};

/* =====================================================================
   ENGINE  (same robust pipeline)
   ===================================================================== */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) {
    if ((r -= i.w) <= 0) return i;
  }
  return items[0];
}

function pickTreatment(recentTreatments) {
  const flat = [];
  for (const sr of TREATMENT_SERIES) {
    const total = sr.variants.reduce((a, v) => a + v[1], 0);
    for (const [name, vw] of sr.variants) {
      if (recentTreatments.includes(name)) continue;
      flat.push({ name, series: sr.n, w: sr.w * (vw / total) });
    }
  }
  return pickWeighted(flat);
}

const LENGTHS = [
  { w: 12, lines: 1, min: 7,  max: 11, rule: 'ONE short line, 7 to 10 words' },
  { w: 16, lines: 2, min: 13, max: 21, rule: 'TWO lines, 14 to 20 words' },
  { w: 30, lines: 3, min: 21, max: 31, rule: 'THREE lines, 22 to 30 words' },
  { w: 28, lines: 4, min: 30, max: 42, rule: 'FOUR lines, 32 to 40 words' },
  { w: 14, lines: 5, min: 40, max: 52, rule: 'FIVE lines, 42 to 50 words' },
];

function chooseLength(recent, minLines = 1) {
  const lens = recent.map((r) => r.lines).filter(Boolean);
  const l1 = lens[lens.length - 1];
  const l2 = lens[lens.length - 2];
  const l3 = lens[lens.length - 3];
  let pool = LENGTHS.filter((x) => x.lines >= minLines);

  const mid = (n) => n === 3 || n === 4;
  if (lens.length >= 3 && mid(l1) && mid(l2) && mid(l3)) {
    const f = pool.filter((x) => !mid(x.lines));
    if (f.length) pool = f;
  } else if (l1 && !mid(l1)) {
    const f = pool.filter((x) => mid(x.lines));
    if (f.length) pool = f;
  }
  if (l1 && l1 === l2) {
    const f = pool.filter((x) => x.lines !== l1);
    if (f.length) pool = f;
  }
  return pickWeighted(pool);
}

function choosePersona(recent) {
  const last = recent.map((r) => r.voice).filter(Boolean).slice(-4);
  const pool = PERSONAS.filter((v) => !last.includes(v.id));
  return pick(pool.length ? pool : PERSONAS);
}

function chooseTopic(recent) {
  const last = recent.map((r) => r.topic).filter(Boolean).slice(-2);
  const pool = ALL_TOPICS.filter((t) => !last.includes(t));
  return TOPICS[pick(pool.length ? pool : ALL_TOPICS)];
}

function chosenChips(body) {
  const labels = Array.isArray(body.selectedChips) ? body.selectedChips : [];
  return labels.filter((l) => typeof l === 'string' && CHIPS[l]).slice(0, 3).map((l) => ({ label: l, ...CHIPS[l] }));
}

function chooseFrom(list, key, recent, n = 3) {
  const last = recent.map((r) => r[key]).filter((v) => v !== undefined && v !== null).slice(-n);
  const pool = list.filter((x) => !last.includes(x));
  return pick(pool.length ? pool : list);
}

const BANNED_OPENINGS = [
  'Great', 'Best', 'Amazing', 'Excellent', 'Highly recommend', 'Bhai', 'Superb', 'Awesome', 'The staff here',
  'Outstanding', 'Fantastic', 'Wonderful', 'Perfect', 'Must visit', 'Trust me',
];

const AI_PHRASES = /seamless|hassle[- ]free|top[- ]notch|look no further|go-to|game[- ]changer|one[- ]stop|unparalleled|exceptional|impeccable|commendable|must[- ]visit|highly recommended|hands down|truly|delighted|kudos|—|–/i;

const DANGLING = new Set([
  'to', 'aur', 'ki', 'ke', 'ka', 'se', 'me', 'mein', 'par', 'pe', 'ko', 'toh',
  'and', 'but', 'the', 'a', 'an', 'of', 'in', 'on', 'for', 'with', 'at', 'that',
  'so', 'if', 'or', 'because', 'jo', 'jab', 'agar', 'lekin', 'ya', 'jaise', 'kyunki',
]);

const HINDI_WORDS = new Set([
  'hai', 'hain', 'nahi', 'nahin', 'bahut', 'bohot', 'bhot', 'mera', 'meri', 'mere', 'mujhe', 'hume',
  'aur', 'ki', 'ke', 'ka', 'ko', 'se', 'par', 'pe', 'tha', 'thi', 'kiya', 'mila', 'mil', 'gaya', 'gayi',
  'liya', 'wala', 'wale', 'jo', 'kaafi', 'accha', 'acha', 'achha', 'sach', 'yahan', 'yaha', 'kar', 'karke', 'raha',
  'rahe', 'rahi', 'laga', 'lagi', 'bilkul', 'ekdum', 'sab', 'kuch', 'koi', 'phir', 'fir', 'bhi', 'toh', 'lekin',
  'isliye', 'abhi', 'dekh', 'dekha', 'diya', 'dikhaya', 'samjhaya', 'sahi', 'dukaan', 'dukan', 'aap', 'aapne',
  'paise', 'kam', 'jyada', 'zyada', 'badhiya', 'mast', 'yaar', 'mein', 'yeh', 'ye', 'woh', 'wo', 'ne', 'hu', 'hun', 'tak', 'wahan', 'sabse', 'dawai', 'aram', 'fayda', 'mam',
]);

const HISTORY = [];
const HITS = new Map();

const openingOf = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 3).join(' ');
const wordSet = (t) => new Set(t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2));

function tooSimilar(text, recentOpenings) {
  const open = openingOf(text);
  if (recentOpenings.includes(open)) return true;
  const ws = wordSet(text);
  for (const h of HISTORY) {
    if (h.open === open) return true;
    let inter = 0;
    for (const w of ws) if (h.ws.has(w)) inter++;
    const union = ws.size + h.ws.size - inter || 1;
    if (inter / union > 0.45) return true;
  }
  return false;
}

function remember(text) {
  HISTORY.push({ open: openingOf(text), ws: wordSet(text) });
  while (HISTORY.length > HISTORY_SIZE) HISTORY.shift();
}

function rateLimited(request) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < 5 * 60 * 1000);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 2000) {
    for (const [k, v] of HITS) if (!v.some((t) => now - t < 5 * 60 * 1000)) HITS.delete(k);
  }
  return arr.length > 25;
}

function cleanReview(text) {
  return text
    .replace(/^["'`\s]+|["'`\s]+$/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.{2,}/g, ' ')
    .replace(/\.\s+/g, ', ')
    .replace(/\.+$/g, '')
    .replace(/,\s*,/g, ',')
    .trim();
}

function fixCutOff(text) {
  let parts = text.trim().replace(/[,\-\s]+$/g, '').split(/\s+/);
  while (parts.length > 6) {
    const last = parts[parts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    if (!DANGLING.has(last)) break;
    parts.pop();
    parts = parts.join(' ').replace(/[,\-\s]+$/g, '').split(/\s+/);
  }
  return parts.join(' ');
}

function looksCutOff(text) {
  const last = text.split(/\s+/).pop().toLowerCase().replace(/[^a-z]/g, '');
  return DANGLING.has(last) || /[,\-]$/.test(text.trim());
}

function hindiCount(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => HINDI_WORDS.has(w)).length;
}

function languageOk(text, language, words) {
  const h = hindiCount(text);
  if (language === 'HINGLISH') return h >= Math.max(3, Math.floor(words * 0.2));
  return h <= 2;
}

function startsBanned(text) {
  const t = text.trim().toLowerCase();
  return BANNED_OPENINGS.some((b) => t.startsWith(b.toLowerCase()));
}

function buildPrompt(body, recent) {
  const language = body.language === 'HINGLISH' ? 'HINGLISH' : 'ENGLISH';
  const businessName = String(body.businessName || 'Dr. Kanika Gupta Clinic').slice(0, 120);
  const category = String(body.category || 'Gynecologist Clinic').slice(0, 200);
  const city = String(body.city || 'Yamuna Vihar, Delhi').slice(0, 120);

  const recentTreatments = recent.map((r) => r.treatment).filter(Boolean).slice(-3);
  let chips = chosenChips(body);
  const picked = chance(0.4) ? pickTreatment(recentTreatments) : null;
  const treatment = picked ? picked.name : null;

  const minLines = chips.length >= 3 ? 4 : chips.length === 2 ? 3 : 1;
  const length = chooseLength(recent, minLines);
  const persona = choosePersona(recent);
  const topic = chips.length
    ? { id: chips[0].id, text: chips[0].text, must: chips[0].must }
    : chooseTopic(recent);
  const extraChips = chips.slice(1);
  const opener = chooseFrom(OPENERS, 'opener', recent, 3);
  const ending = chooseFrom(ENDINGS, 'ending', recent, 2);
  const style = pick(WRITING_STYLES);
  const hinglishLevel = pick(HINGLISH_LEVELS);
  const buyerLine = chance(0.6) ? pick(BUYER_LINES) + ' ' : '';

  const longEnough = length.lines >= 3;
  const secondPoint = !extraChips.length && length.lines >= 4 && chance(0.5);
  const mentionName = chance(0.4);
  const useEmoji = chance(0.05);

  const recentSeo = recent.map((r) => r.seo).filter(Boolean).slice(-8);
  const seoPool = SEO_KEYWORDS.filter((k) => !recentSeo.includes(k));
  const seo = chance(0.35) ? pick(seoPool.length ? seoPool : SEO_KEYWORDS) : null;

  const languageBlock =
    language === 'HINGLISH'
      ? `LANGUAGE (MOST IMPORTANT): Write in HINGLISH = Hindi sentences typed in English/Roman letters, like a Delhi patient on WhatsApp. Level: ${hinglishLevel}. Grammar must be Hindi (hai, tha, diya, check kiya, dawa, bahut, aur etc.). Medical terms like treatment, pregnancy, clinic can stay in English. Never write a full English sentence. Never use Devanagari.`
      : `LANGUAGE (MOST IMPORTANT): Write in simple natural English like an Indian patient. Do not use Hindi words.`;

  const examples = shuffle(EXAMPLES[language]).slice(0, 3).map((e) => `- ${e}`).join('\n');

  const prompt = `${languageBlock}

You are ${persona.text}. ${buyerLine}You are writing a Google Maps review for this Gynecologist/Clinic.
Business: ${businessName} (${city}) | ${category}

Tone samples from other patients (only for feel, never copy words or structure):
${examples}

THIS REVIEW:
- Main topic: ${topic.text}. The review must clearly be about this.
${extraChips.length ? `- ALSO naturally cover these points (all of them): ${extraChips.map((c) => c.text).join('; ')}.` : secondPoint ? '- You may add one small extra point at the end, from any other area (like clean clinic or less waiting time).' : '- Stick to the main topic only.'}
- Writing style: ${style}.
- Opening: ${opener}.
${longEnough ? `- Ending: ${ending}.` : ''}
- Length: ${length.rule}. Stay inside this range.
${mentionName ? `- Mention "Dr. Kanika" or "Dr. Kanika Gupta" once naturally.` : '- Do not repeat the full doctor name, use "mam" or "doctor".'}
${seo ? `- If it fits naturally, include the phrase "${seo}".` : ''}
${treatment ? `- You may mention that the visit was for "${treatment}".` : ''}
${useEmoji ? '- One medical/happy emoji at the very end is allowed.' : '- No emojis.'}

HARD RULES:
- ONE single paragraph. No line breaks, bullets or title.
- Do NOT use a full stop (.) anywhere. Use commas, "aur"/"and", or just flow.
- Never start with: ${BANNED_OPENINGS.join(', ')}.
- Sound like a real patient, not a clinic advertisement. No hashtags, slogans, keyword stuffing, no dashes. Avoid polished marketing words (seamless, hassle-free, top-notch, exceptional).
- Do not invent false guarantees or exact medicine prices.
- End with a COMPLETE thought. Never stop mid-sentence.
- Output only the review text.`.replace(/\n{3,}/g, '\n\n').replace(/\n\n(- )/g, '\n$1');

  return { prompt, length, persona, topic, extraChips, opener, ending, seo, treatment, language };
}

async function callGemini(apiKey, payload, signal) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    }
  );
  const data = await res.json();
  return { res, data };
}

async function attempt(apiKey, body, recent, signal) {
  const built = buildPrompt(body, recent);
  const { prompt, length, persona, topic, extraChips, opener, ending, seo, treatment, language } = built;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: `Write the clinic review now.` }] }],
    systemInstruction: { parts: [{ text: prompt }] },
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  try {
    let { res, data } = await callGemini(apiKey, payload, signal);

    if (!res.ok && /thinking/i.test(data?.error?.message || '')) {
      delete payload.generationConfig.thinkingConfig;
      ({ res, data } = await callGemini(apiKey, payload, signal));
    }
    if (!res.ok) return { ok: false, error: data?.error?.message || 'Gemini API request failed.' };

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const raw = parts.filter((p) => !p.thought).map((p) => p.text || '').join('');
    const review = fixCutOff(cleanReview(raw));
    const words = review.split(/\s+/).filter(Boolean).length;

    if (!review) return { ok: false, error: 'Empty response from Gemini.' };
    if (candidate?.finishReason === 'MAX_TOKENS') return { ok: false, error: 'Response was cut off.' };
    if (looksCutOff(review)) return { ok: false, error: 'Review ended mid-sentence.' };
    if (words > length.max + 8) return { ok: false, error: 'Review too long.' };
    if (words < Math.floor(length.min * 0.75)) return { ok: false, error: 'Review too short.' };
    if (/[ऀ-ॿ]/.test(review)) return { ok: false, error: 'Devanagari used.' };
    if (AI_PHRASES.test(review)) return { ok: false, error: 'Robotic phrase used.' };
    if (startsBanned(review)) return { ok: false, error: 'Banned opening used.' };
    if (!languageOk(review, language, words)) return { ok: false, error: 'Wrong language style.' };
    if (!topic.must.test(review)) return { ok: false, error: 'Review missed the selected topic.' };
    if (extraChips.some((c) => !c.must.test(review))) return { ok: false, error: 'Review missed a selected keyword.' };
    const recentOpenings = recent.map((r) => r.open).filter(Boolean);
    if (tooSimilar(review, recentOpenings)) return { ok: false, error: 'Too similar to an earlier review.' };

    return {
      ok: true,
      review,
      meta: {
        lines: length.lines,
        voice: persona.id,
        topic: topic.id,
        opener,
        ending,
        seo: seo || null,
        treatment: treatment || null,
        open: openingOf(review),
      },
    };
  } catch (e) {
    return { ok: false, error: e?.name === 'AbortError' ? 'aborted' : e?.message || 'Request failed.', aborted: e?.name === 'AbortError' };
  }
}

function firstValid(tasks) {
  return new Promise((resolve) => {
    let pending = tasks.length;
    let firstError = null;
    for (const t of tasks) {
      t.then((r) => {
        if (r.ok) return resolve(r);
        if (!r.aborted && !firstError) firstError = r.error;
        if (--pending === 0) resolve({ ok: false, error: firstError || 'Failed to generate review draft.' });
      });
    }
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured.' }, { status: 500 });
    }
    if (rateLimited(request)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const recent = (Array.isArray(body.recentLengths) ? body.recentLengths : [])
      .filter((r) => r && typeof r === 'object')
      .slice(-6);

    let lastError = 'Failed to generate review draft.';

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);

      const winner = await firstValid(
        Array.from({ length: PARALLEL_CALLS }, () => attempt(apiKey, body, recent, controller.signal))
      );

      clearTimeout(timer);
      controller.abort();

      if (winner.ok) {
        remember(winner.review);
        return NextResponse.json({ review: winner.review, meta: winner.meta });
      }
      lastError = winner.error;
    }

    throw new Error(lastError);
  } catch (error) {
    console.error('API Review Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate review draft.' },
      { status: 500 }
    );
  }
}
