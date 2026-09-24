// Tavily search - pulls current rules from official Irish sources
// (revenue.ie, citizensinformation.ie, irishimmigration.ie, rtb.ie).
// Runtime Tavily call also enters the hackathon's $3,000 Best Use of Tavily prize.
const KEY = process.env.TAVILY_API_KEY;

const OFFICIAL_DOMAINS = [
  'revenue.ie', 'citizensinformation.ie', 'irishimmigration.ie',
  'rtb.ie', 'gov.ie', 'welfare.ie',
];

export async function currentRules(query) {
  if (!KEY) return { enabled: false, results: [] };
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: KEY,
      query,
      include_domains: OFFICIAL_DOMAINS,
      max_results: 4,
      search_depth: 'basic',
    }),
  });
  if (!res.ok) return { enabled: true, error: `Tavily ${res.status}`, results: [] };
  const data = await res.json();
  return {
    enabled: true,
    results: (data.results || []).map((r) => ({ title: r.title, url: r.url, snippet: r.content?.slice(0, 300) })),
  };
}

export function rulesQueryFor(classification, extracted) {
  const topic = {
    revenue: 'income tax demand payment deadline',
    immigration: 'IRP renewal stamp 2 requirements',
    housing: 'rent increase notice rent pressure zone rules',
    college: 'international student fees letter',
    welfare: 'social welfare payment letter',
    bank_utility: 'final demand notice consumer rights Ireland',
    other: 'official letter what to do',
  }[classification.doc_type] || 'official letter what to do';
  return `Ireland ${topic} site rules 2026`;
}
