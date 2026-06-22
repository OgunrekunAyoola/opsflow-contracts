import { z } from 'zod';
import {
  TicketSchema,
  TriageOutputSchema,
  EnrichmentSchema,
  RAGContextItemSchema,
  ToolResultSchema,
  HandbackContextSchema,
  PaymentContextSchema,
} from '../../state/AgentState';
import { ENVELOPE_VERSION } from '../../version/boundary';
import type { AgentContract } from '../AgentContract';

/**
 * Response agent contract (P6) — drafts the customer reply. The orchestrator builds this input
 * slice from AgentState; the agent emits an AgentResult whose `output.draftResponse` is the
 * reply. No tools (pure generation). Payment defense-in-depth + AI disclosure live in the agent.
 */
export const ResponseInputSchema = z.object({
  ticket: TicketSchema,
  triageOutput: TriageOutputSchema.optional(),
  enrichment: EnrichmentSchema.optional(),
  ragContext: z.array(RAGContextItemSchema).optional(),
  toolResults: z.array(ToolResultSchema).optional(),
  threadSummary: z.string().optional(),
  customerFacts: z.array(z.string()).optional(),
  handbackContext: HandbackContextSchema.optional(),
  paymentContext: PaymentContextSchema.optional(),
  brandVoicePrompt: z.string().optional(),
  isFirstContact: z.boolean().optional(),
});
export type ResponseInput = z.infer<typeof ResponseInputSchema>;

export const ResponseOutputSchema = z.object({
  draftResponse: z.string().optional(),
});
export type ResponseOutput = z.infer<typeof ResponseOutputSchema>;

export const responseContract: AgentContract<typeof ResponseInputSchema, typeof ResponseOutputSchema> = {
  agent: 'response',
  version: '1.0.0',
  domain: 'support',
  envelopeVersion: ENVELOPE_VERSION,
  input: ResponseInputSchema,
  output: ResponseOutputSchema,
  allowedTools: [], // pure generation — no tools
  secrets: ['agent:response:llm'],
  emits: [],
  timeoutMs: 30_000,
};
