# Form Friend

**Ireland's bureaucracy, explained.** Snap or paste an official letter - Revenue, immigration (ISD/INIS), your landlord, your college - and Form Friend gives you a plain-language summary, the deadline pulled out, and a pre-filled reply you can send.

Built for international students and immigrants in Ireland, by one.

Entry in the **Nebius x NVIDIA Global AI Hackathon 2026**.

## Why

One in six people in Ireland was born elsewhere. Official letters assume native-level English and knowledge of the system: what an IRP renewal demand means, what happens if you ignore a Revenue notice, which reference number matters. Missing a deadline costs real money and real status. Form Friend is the friend who reads the letter with you.

## How it works

1. **Classify** - letter type and sender (Nemotron Nano, fast tier)
2. **Extract** - deadlines, amounts, reference numbers, required actions (Nemotron Nano)
3. **Summarize** - plain-English explanation; hard cases (money owed, refusals, legal deadlines) route up to **Nemotron Ultra** for serious reasoning
4. **Reply** - a pre-filled formal reply draft (Nemotron Ultra)

Tiered model routing follows the pattern the hackathon brief asks for: Nano handles the fast everyday calls, Ultra handles the reasoning, so the app stays responsive and credits stretch.

Planned: a LoRA fine-tuned document classifier on Token Factory post-training (with a benchmark table vs the Nano baseline), Tavily for current rules, and vision input via Nemotron Nano-Omni for photographed letters.

## Stack

- **Models:** NVIDIA Nemotron 3 Nano 30B / Super 120B / Ultra 550B on **Nebius Token Factory** (OpenAI-compatible API)
- **Server:** Node 20+, zero-dependency BFF (`server/`)
- **Client:** Angular app (`client/`, in progress)
- **Deploy:** demo URL TBD; Token Factory for all inference

## Run it

```bash
cd server
cp .env.example .env   # add your NEBIUS_API_KEY
node src/index.js
# POST http://localhost:8080/api/analyze  { "letter": "..." }
# GET  http://localhost:8080/api/health
```

With the client built (`cd client && npm ci && npx ng build`), the same server
also serves the app at `/` - one process, one URL.

## Deploy

`render.yaml` defines a single free Render web service (Angular build + API).
Connect the repo on Render, pick "Blueprint", and set `NEBIUS_API_KEY`
(and optionally `TAVILY_API_KEY`) in the dashboard.

## Repo layout

- `server/` - the analysis pipeline and API
- `client/` - Angular frontend (in progress)
- `docs/` - architecture, submission checklist, research notes
- `data/samples/` - sample letters used for development and the eval set

## Disclaimer

Form Friend explains letters; it is not legal, tax, or immigration advice.

## License

MIT - see [LICENSE](LICENSE).
