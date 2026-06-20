# @opsflow/contracts

The typed boundary every OpsFlow repo depends on. Dependency direction is strict:
**contracts → everything; nothing depends back up** (see `REPO_TOPOLOGY.md`).

## What's here
| Area | Owns |
|---|---|
| `enums` | shared vocabulary — tier, ticket status, priority/urgency, channel, consent, quality gate, routing decision, role, sentiment, language, thread state, message classification, request scope |
| `state` | `AgentState` zod schema + inferred types (no LangGraph — the graph `Annotation` lives in `pipelines`) |
| `agent` | `AgentContract` + the standardized `AgentResult` envelope (+ `packageResult` / `validate_and_package` helper) |
| `tools` | tool-contract types (`ToolContract`) |
| `events` | domain event names, payloads, the typed envelope + bus interface, `makeDomainEvent` |
| `version` | envelope versioning + boundary validation (`ENVELOPE_VERSION`, `isEnvelopeCompatible`, `assertEnvelopeCompatible`) |

## Specs
- `AGENT_CONTRACT_SPEC.md` — the contract + envelope (canonical)
- `REPO_TOPOLOGY.md` — the repo set + final state
- `COMPOSITION_MODEL_SPEC.md` — pipelines + router

## Develop
```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # jest
npm run build       # tsc → dist/ (published artifact)
```

Published as `@opsflow/contracts` via GitHub Packages (semver; agents pin a minor —
breaking = major bump, validated at the boundary by the orchestrator).
