// Nebius Token Factory client (OpenAI-compatible chat completions).
// Model IDs verified against the official cookbook (nebius/token-factory-cookbook).
const BASE_URL = process.env.NEBIUS_BASE_URL || 'https://api.tokenfactory.us-central1.nebius.com/v1';
const API_KEY = process.env.NEBIUS_API_KEY;

export const MODELS = {
  // Fast everyday calls: classification, extraction
  nano: 'nvidia/nvidia-nemotron-3-nano-30b-a3b',
  // Mid tier
  super: 'nvidia/nemotron-3-super-120b-a12b',
  // Serious reasoning: hard letters, reply drafting
  ultra: 'nvidia/Nemotron-3-Ultra-550b-a55b',
  // Multimodal (vision) - for reading photographed letters
  omni: 'nvidia/nemotron-3-nano-omni',
};

export async function chat({ model, messages, temperature = 0.2, maxTokens = 1200 }) {
  if (!API_KEY) throw new Error('NEBIUS_API_KEY is not set');
  const started = Date.now();
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token Factory ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    model,
    latencyMs: Date.now() - started,
    usage: data.usage ?? null,
  };
}
