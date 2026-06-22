import type { ZodTypeAny } from 'zod';
import type { ValidationCheck } from './AgentResult';

/**
 * AgentContract (AGENT_CONTRACT_SPEC §2) — the per-agent contract validated at the
 * boundary. It turns a shared-state node function into a first-class agent: an
 * explicit input slice, an output schema, a capability (tool) scope, secret scopes,
 * and a pinned version. Applies to the 4 agents only (triage, resolution, response,
 * memory); deterministic steps do not carry contracts.
 *
 * DECIDED: the orchestrator builds a typed context from AgentState per `input` and
 * passes ONLY that — no agent reads the whole AgentState.
 */
export interface AgentContract<I extends ZodTypeAny = ZodTypeAny, O extends ZodTypeAny = ZodTypeAny> {
  /** Agent id, e.g. "resolution". */
  agent: string;
  /** Semver of the agent, pinned by the agent repo. */
  version: string;
  /** Domain this agent serves, e.g. "support". */
  domain: string;
  /** The AgentResult envelope version this agent emits (see version/boundary). */
  envelopeVersion: string;
  /** The explicit context slice the agent accepts (not the whole state). */
  input: I;
  /** The result payload schema, validated INSIDE the envelope. */
  output: O;
  /** Capability scope — tool names the agent may call (buildToolsHandle enforces). */
  allowedTools: string[];
  /** Per-agent secret scopes (Block 5), e.g. "agent:resolution:llm". */
  secrets: string[];
  /** Event types this agent may emit (governed). */
  emits?: string[];
  /** Execution budget hint for the orchestrator (ms). */
  timeoutMs?: number;
}

/**
 * Self-validation (AGENT_CONTRACT_SPEC §3) — an agent validates its own output against the
 * contract's output schema before packaging the AgentResult. Deterministic-primary: a schema
 * failure means the agent must NOT report `ok`. Returns checks for the envelope's `validation`.
 */
export function selfValidate<O extends ZodTypeAny>(
  contract: AgentContract<ZodTypeAny, O>,
  output: unknown,
): { selfValidated: boolean; checks: ValidationCheck[] } {
  const res = contract.output.safeParse(output);
  if (res.success) {
    return { selfValidated: true, checks: [{ name: 'output_schema', passed: true }] };
  }
  return {
    selfValidated: false,
    checks: [
      {
        name: 'output_schema',
        passed: false,
        detail: res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      },
    ],
  };
}
