# Architecture

```
letter text / photo
        |
        v
+---------------------+        +---------------------------+
|  Angular client     |  POST  |  Node BFF (server/)       |
|  (client/)          |------->|  /api/analyze             |
+---------------------+        +---------------------------+
                                          |
              +---------------------------+---------------------------+
              |                           |                           |
              v                           v                           v
     classify (Nano)             extract (Nano)             summarize + reply
     doc_type, sender,           deadlines, amounts,        Ultra on hard cases
     hard_case flag              refs, actions              (tiered routing)
                                          |
                                          v
                          structured result JSON for the UI
```

## Tiered routing

| Step | Default model | Escalates to |
|------|---------------|--------------|
| Classify | Nemotron 3 Nano 30B | fine-tuned classifier (planned) |
| Extract | Nemotron 3 Nano 30B | - |
| Summarize | Nemotron 3 Nano 30B | Nemotron 3 Ultra 550B when `is_hard_case` |
| Reply draft | Nemotron 3 Ultra 550B | - |

Model IDs (verified against nebius/token-factory-cookbook):
- `nvidia/nvidia-nemotron-3-nano-30b-a3b`
- `nvidia/nemotron-3-super-120b-a12b`
- `nvidia/Nemotron-3-Ultra-550b-a55b`
- `nvidia/nemotron-3-nano-omni` (vision, planned)

Base URL: `https://api.tokenfactory.us-central1.nebius.com/v1` (OpenAI-compatible).

## Cost discipline

Every response carries `usage` + latency; the eval harness (`server/src/eval/`) will
turn these into the benchmark + cost table for the write-up.
