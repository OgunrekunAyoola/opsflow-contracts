import type { ZodTypeAny } from 'zod';

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
