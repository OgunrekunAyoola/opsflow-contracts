import { z } from 'zod';
import {
  TicketSchema,
  TriageOutputSchema,
  EnrichmentSchema,
  RAGContextItemSchema,
  ToolResultSchema,
} from '../../state/AgentState';
import { RoutingDecisionEnum } from '../../enums';
import { ENVELOPE_VERSION } from '../../version/boundary';
import type { AgentContract } from '../AgentContract';

/**
 * Resolution agent contract (P4 / M1) — the first first-class agent. The orchestrator builds
 * this input slice from AgentState and passes ONLY it; the agent emits an AgentResult whose
 * `output` is validated against ResolutionOutputSchema (self-validation + boundary validation).
 */
export const ResolutionInputSchema = z.object({
  ticket: TicketSchema,
  triageOutput: TriageOutputSchema.optional(),
  enrichment: EnrichmentSchema.optional(),
  ragContext: z.array(RAGContextItemSchema).optional(),
  maxToolAttempts: z.number().int().positive(),
});
export type ResolutionInput = z.infer<typeof ResolutionInputSchema>;

// Resolution owns routingDecision (SOC manifest exception) + toolResults; the draft is
// produced downstream by ResponseAgentNode, so it is NOT a resolution output.
export const ResolutionOutputSchema = z.object({
  routingDecision: RoutingDecisionEnum.optional(),
  escalationReason: z.string().optional(),
  toolResults: z.array(ToolResultSchema),
});
export type ResolutionOutput = z.infer<typeof ResolutionOutputSchema>;

export const resolutionContract: AgentContract<typeof ResolutionInputSchema, typeof ResolutionOutputSchema> =
  {
    agent: 'resolution',
    version: '1.0.0',
    domain: 'support',
    envelopeVersion: ENVELOPE_VERSION,
    input: ResolutionInputSchema,
    output: ResolutionOutputSchema,
    // Mirrors the runtime tool scope for ResolutionAgentNode (AGENT_CONTRACTS).
    allowedTools: [
      'kb_lookup',
      'escalate_ticket',
      'check_order_status',
      'reset_password',
      'get_customer_orders',
      'product_lookup',
      'check_inventory',
      'update_delivery_address',
      'add_order_note',
      // Conversion (CONVERSION_CAPABILITY_DESIGN) — capture an unpaid order + generate a pay link.
      'create_order',
      'payment_link',
    ],
    secrets: ['agent:resolution:llm'],
    emits: [],
    timeoutMs: 60_000,
  };
