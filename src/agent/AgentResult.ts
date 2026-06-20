import { ENVELOPE_VERSION } from '../version/boundary';

/**
 * AgentResult envelope (AGENT_CONTRACT_SPEC §3) — the standardized return shape
 * EVERY agent emits. The orchestrator validates the envelope (version + schema),
 * not the agent's internals. Field set is LOCKED.
 */

export type AgentResultStatus = 'ok' | 'declined' | 'escalated' | 'error';

export interface ValidationCheck {
  name: string;
  passed: boolean;
  detail?: string;
}

export interface ToolCallRecord {
  tool: string;
  ok: boolean;
  latencyMs: number;
  idempotencyKey?: string;
}

export interface AuditRef {
  action: string;
  auditLogId?: string;
}

export interface AgentResultError {
  code: string;
  message: string;
  /** Drives BullMQ retry (true) vs fail-closed handling (false). */
  retryable: boolean;
}

export interface AgentResult<T = unknown> {
  // identity + versioning
  agent: string;
  agentVersion: string;
  envelopeVersion: string;
  // outcome
  status: AgentResultStatus;
  output: T; // validated against contract.output (partial/empty iff status='error')
  confidence?: number; // 0–1
  // self-validation (deterministic-primary, LLM-secondary)
  validation: { selfValidated: boolean; checks: ValidationCheck[] };
  // side-effect records
  toolCalls: ToolCallRecord[];
  cost: { llmUsd: number; tokens: { in: number; out: number } };
  audit: AuditRef[];
  // control hints — ADVISORY ONLY; the orchestrator decides
  next?: string;
  // error — populated iff status='error'
  error?: AgentResultError;
  // observability
  timing: { startedAt: string; finishedAt: string; durationMs: number };
  correlationId: string;
}

export interface PackageEnvelopeInput<T> {
  agent: string;
  agentVersion: string;
  status: AgentResultStatus;
  output: T;
  correlationId: string;
  startedAt: number; // epoch ms (Date.now() at agent entry)
  confidence?: number;
  validation?: { selfValidated: boolean; checks: ValidationCheck[] };
  toolCalls?: ToolCallRecord[];
  cost?: { llmUsd: number; tokens: { in: number; out: number } };
  audit?: AuditRef[];
  next?: string;
  error?: AgentResultError;
  /** Override the emitted envelope version (defaults to this build's ENVELOPE_VERSION). */
  envelopeVersion?: string;
  /** Override finish time (defaults to Date.now()); mainly for tests. */
  finishedAt?: number;
}

/**
 * Build a well-formed AgentResult envelope — the `validate_and_package` helper.
 * Stamps the current ENVELOPE_VERSION and computes timing; fills the required
 * record fields with safe empties so every emitted envelope is complete.
 */
export function packageResult<T>(input: PackageEnvelopeInput<T>): AgentResult<T> {
  const finishedAt = input.finishedAt ?? Date.now();
  return {
    agent: input.agent,
    agentVersion: input.agentVersion,
    envelopeVersion: input.envelopeVersion ?? ENVELOPE_VERSION,
    status: input.status,
    output: input.output,
    confidence: input.confidence,
    validation: input.validation ?? { selfValidated: false, checks: [] },
    toolCalls: input.toolCalls ?? [],
    cost: input.cost ?? { llmUsd: 0, tokens: { in: 0, out: 0 } },
    audit: input.audit ?? [],
    next: input.next,
    error: input.error,
    timing: {
      startedAt: new Date(input.startedAt).toISOString(),
      finishedAt: new Date(finishedAt).toISOString(),
      durationMs: Math.max(0, finishedAt - input.startedAt),
    },
    correlationId: input.correlationId,
  };
}
