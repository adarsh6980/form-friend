// Form Friend pipeline: letter text in -> structured help out.
// Tiered routing per the hackathon brief: Nano for fast classify/extract,
// Ultra for hard reasoning and reply drafting.
import { chat, MODELS } from './nebius.js';

const DOC_TYPES = [
  'revenue',          // Revenue Commissioners (tax)
  'immigration',      // ISD/INIS/IRP/GNIB letters
  'housing',          // landlord, RTB, threshold notices
  'college',          // university/college admin
  'welfare',          // DEASP / Intreo
  'bank_utility',     // banks, utilities, mobile
  'other',
];

function parseJson(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('model did not return JSON');
  return JSON.parse(m[0]);
}

export async function classify(letterText) {
  const r = await chat({
    model: MODELS.nano,
    maxTokens: 300,
    messages: [
      { role: 'system', content:
        'You classify official letters received by international students and immigrants in Ireland. ' +
        `Reply with ONLY JSON: {"doc_type": one of ${JSON.stringify(DOC_TYPES)}, "sender": string, "confidence": 0-1, "is_hard_case": boolean}. ` +
        'is_hard_case=true when the letter involves money owed, legal deadlines, refusal/appeal, or confusing multi-part demands.' },
      { role: 'user', content: letterText.slice(0, 6000) },
    ],
  });
  return { ...parseJson(r.content), _meta: { model: r.model, latencyMs: r.latencyMs, usage: r.usage } };
}

export async function extract(letterText) {
  const r = await chat({
    model: MODELS.nano,
    maxTokens: 600,
    messages: [
      { role: 'system', content:
        'Extract key facts from an official Irish letter. Reply with ONLY JSON: ' +
        '{"deadlines": [{"date": "YYYY-MM-DD or null", "what": string}], "amounts": [{"value": string, "what": string}], ' +
        '"reference_numbers": [string], "actions_required": [string], "recipient_must": string}. null/empty when absent.' },
      { role: 'user', content: letterText.slice(0, 6000) },
    ],
  });
  return { ...parseJson(r.content), _meta: { model: r.model, latencyMs: r.latencyMs, usage: r.usage } };
}

export async function summarize(letterText, classification, hard) {
  const r = await chat({
    model: hard ? MODELS.ultra : MODELS.nano,
    maxTokens: 900,
    messages: [
      { role: 'system', content:
        'You explain official Irish letters in plain English to a non-native speaker. ' +
        'Be warm, concrete, and brief. Structure: 1) one-sentence bottom line, 2) what this means for you, ' +
        '3) what to do next (numbered), 4) what happens if you ignore it. ' +
        'Never invent rules. If unsure, say so and point to the official body. Not legal advice.' },
      { role: 'user', content: `Letter type: ${classification.doc_type}, sender: ${classification.sender}.\n\nLetter:\n${letterText.slice(0, 8000)}` },
    ],
  });
  return { text: r.content, _meta: { model: r.model, latencyMs: r.latencyMs, usage: r.usage } };
}

export async function draftReply(letterText, extracted, classification) {
  const r = await chat({
    model: MODELS.ultra,
    maxTokens: 900,
    messages: [
      { role: 'system', content:
        'Draft a short, polite, formal reply letter the recipient could send to the Irish organisation. ' +
        'Use the reference numbers and deadlines given. Leave [bracketed] placeholders for personal details. ' +
        'Keep it under 200 words.' },
      { role: 'user', content: `Sender: ${classification.sender}\nFacts: ${JSON.stringify(extracted)}\n\nOriginal letter:\n${letterText.slice(0, 6000)}` },
    ],
  });
  return { text: r.content, _meta: { model: r.model, latencyMs: r.latencyMs, usage: r.usage } };
}

export async function analyze(letterText) {
  const t0 = Date.now();
  const classification = await classify(letterText);
  const extracted = await extract(letterText);
  const hard = classification.is_hard_case === true;
  const summary = await summarize(letterText, classification, hard);
  const reply = await draftReply(letterText, extracted, classification);
  return {
    classification, extracted, summary, reply,
    meta: {
      totalMs: Date.now() - t0,
      tiering: { classify: MODELS.nano, extract: MODELS.nano, summarize: hard ? 'ultra(hard case)' : 'nano', reply: 'ultra' },
    },
  };
}
