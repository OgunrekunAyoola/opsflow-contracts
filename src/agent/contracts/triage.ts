import { z } from 'zod';
import { TicketSchema, TriageOutputSchema, PaymentContextSchema } from '../../state/AgentState';
import { ENVELOPE_VERSION } from '../../version/boundary';
import type { AgentContract } from '../AgentContract';

/**
 * Triage agent contract (P6, final agent) — the compliance-critical first node. Classifies the
 * ticket and runs the deterministic safety signals (payment ADR-068, opt-out ADR-057, distress
 * ADR-067, scope). Those signals + the consent/scope services are INJECTED (they stay in the
 * host with their tests); the agent orchestrates them and emits a self-validated AgentResult.
 * The DistressDetected event is emitted by the host wrapper from output.triageOutput.isDistressed.
 */
export const TriageAgentInputSchema = z.object({
  ticket: TicketSchema,
});
export type TriageAgentInput = z.infer<typeof TriageAgentInputSchema>;

export const TriageAgentOutputSchema = z.object({
  triageOutput: TriageOutputSchema,
  paymentContext: PaymentContextSchema.optional(),
});
export type TriageAgentOutput = z.infer<typeof TriageAgentOutputSchema>;

export const triageContract: AgentContract<typeof TriageAgentInputSchema, typeof TriageAgentOutputSchema> = {
  agent: 'triage',
  version: '1.0.0',
  domain: 'support',
  envelopeVersion: ENVELOPE_VERSION,
  input: TriageAgentInputSchema,
  output: TriageAgentOutputSchema,
  allowedTools: [],
  secrets: ['agent:triage:llm'],
  emits: ['DistressDetected'],
  timeoutMs: 20_000,
};
