// Eval harness: runs the pipeline over data/samples and prints a
// per-step model, latency and token-usage table. This becomes the
// benchmark + cost table in the hackathon write-up.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { analyze } from '../pipeline.js';

const dir = new URL('../../data/samples/', import.meta.url).pathname;
const files = readdirSync(dir).filter((f) => f.endsWith('.txt'));

const rows = [];
for (const f of files) {
  const letter = readFileSync(join(dir, f), 'utf8');
  const t0 = Date.now();
  const r = await analyze(letter);
  rows.push({
    sample: f,
    doc_type: r.classification.doc_type,
    hard: r.classification.is_hard_case,
    classify_ms: r.classification._meta.latencyMs,
    extract_ms: r.extracted._meta.latencyMs,
    summary_ms: r.summary._meta.latencyMs,
    reply_ms: r.reply._meta.latencyMs,
    total_ms: Date.now() - t0,
    tokens: ['classification', 'extracted', 'summary', 'reply']
      .map((k) => r[k]._meta.usage?.total_tokens ?? 0)
      .reduce((a, b) => a + b, 0),
  });
  console.log(`done: ${f} (${rows.at(-1).total_ms}ms)`);
}

console.table(rows);
console.log('Note: Token Factory bills per token; multiply `tokens` by the per-model price for the cost table.');
