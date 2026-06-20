import type { ZodTypeAny } from 'zod';

/**
 * Tool contract types (ADR-T1/T2/T3). Contracts owns the type-level shape of a tool;
 * the runtime ToolRegistry / ToolsHandle implementation lives in `platform`, and the
 * per-agent allow-lists live in each `AgentContract.allowedTools` + the capability
 * manifest (orchestrator).
 */
export interface ToolContract {
  /** Stable tool id, e.g. "check_order_status". */
  name: string;
  description: string;
  /** Schema for the tool's input arguments. */
  inputSchema: ZodTypeAny;
  /**
   * Whether the tool mutates state. Drives ADR-T5 idempotency. Lives on the
   * contract (not a hardcoded set) so a new mutating tool can't silently miss
   * idempotency protection (audit N-20).
   */
  mutating: boolean;
  /**
   * ADR-068: humanOnly tools (e.g. refund_order) must NEVER appear in any agent's
   * contract; validated at startup. Money-touching tools are humanOnly by rule.
   */
  humanOnly: boolean;
}
