# Form Friend - Devpost submission draft

## Inspiration
Everyone who has moved to Ireland knows the feeling: an official envelope
arrives - Revenue, INIS, the RTB - full of dense formal language, and you
spend an evening googling what half of it means and whether you have to do
anything by Friday. Adarsh moved to Ireland and lives this. Form Friend is
the friend who has read every Irish government letter before and explains
yours in plain English, then drafts your reply.

## What it does
Paste (or photograph) an official Irish letter. Form Friend:
1. **Classifies** it (Revenue, immigration, housing/tenancy, social welfare...)
2. **Extracts** the facts: names, reference numbers, dates, deadlines, amounts
3. **Summarizes** it in plain English - what it's really saying, what you must
   do, and what happens if you don't
4. **Drafts a reply** letter you can adapt and send
5. Shows **current official guidance** alongside, via Tavily search restricted
   to revenue.ie, citizensinformation.ie, gov.ie, inis.gov.ie and rtb.ie

## How we built it
- Four-stage LLM pipeline on **Nebius Token Factory** using NVIDIA **Nemotron 3**
  models: `nemotron-3-nano-30b` for classification and extraction (fast, cheap),
  `nemotron-3-ultra-550b` for summarizing complex letters and drafting replies.
  A difficulty score decides per-letter whether to escalate - the tiered
  strategy recommended in Nebius's own Nemotron cookbook.
- Zero-dependency Node.js BFF serves the REST API and the Angular client as a
  single service; deploys in one click (render.yaml included).
- Every stage call is logged with latency and token usage - see
  `server/src/eval/` - so we can report the real cost of processing one letter.

## Challenges
- Making legal-sounding extraction reliable without a giant model on every
  call - solved with staged escalation and structured outputs.
- Irish bureaucracy spans many agencies with different formats; the classifier
  keeps the prompt surface small per domain.

## Accomplishments
- End-to-end working product, not a chatbot demo: letter in, reply draft out,
  with per-letter cost readout (~$0.004 typical - see eval results).
- Benchmark table across Nano/Super/Ultra tiers.

## What we learned
Tiered small/large model routing gives near-Ultra quality at Nano prices for
the common cases; honest cost measurement is a feature users actually want.

## What's next
Vision input (Nemotron Omni) so you can snap a photo of the letter; more
agencies; Irish-language support.
