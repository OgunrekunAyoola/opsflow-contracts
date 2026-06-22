import { z } from 'zod';
import { TicketSchema, EnrichmentSchema, TriageOutputSchema, MemorySchema } from '../../state/AgentState';
import { ENVELOPE_VERSION } from '../../version/boundary';
import type { AgentContract } from '../AgentContract';

/**
 * Memory agent contracts (P6). Two operations: READ (hydrate long-term memory before the
 * pipeline) and WRITE (extract facts + thread summary after resolution, persist them). Both
 * emit a self-validated AgentResult; write is side-effect-only (empty output). Runtime caps
 * (memory store, repos, LLM, prompt rendering) are injected by the host.
 */

// ── Read ──────────────────────────────────────────────────────────────────────
export const MemoryReadInputSchema = z.object({
  ticket: TicketSchema,
  enrichment: EnrichmentSchema.optional(),
});
export type MemoryReadInput = z.infer<typeof MemoryReadInputSchema>;

export const MemoryReadOutputSchema = z.object({
  memory: MemorySchema.optional(),
});
export type MemoryReadOutput = z.infer<typeof MemoryReadOutputSchema>;

export const memoryReadContract: AgentContract<typeof MemoryReadInputSchema, typeof MemoryReadOutputSchema> =
  {
    agent: 'memory',
    version: '1.0.0',
    domain: 'support',
    envelopeVersion: ENVELOPE_VERSION,
    input: MemoryReadInputSchema,
    output: MemoryReadOutputSchema,
    allowedTools: [],
    secrets: [],
    emits: [],
    timeoutMs: 10_000,
  };

// ── Write ─────────────────────────────────────────────────────────────────────
export const MemoryWriteInputSchema = z.object({
  ticket: TicketSchema,
  enrichment: EnrichmentSchema.optional(),
  triageOutput: TriageOutputSchema.optional(),
  draftResponse: z.string().optional(),
  threadId: z.string().optional(),
});
export type MemoryWriteInput = z.infer<typeof MemoryWriteInputSchema>;

export const MemoryWriteOutputSchema = z.object({}); // side-effect-only
export type MemoryWriteOutput = z.infer<typeof MemoryWriteOutputSchema>;

export const memoryWriteContract: AgentContract<
  typeof MemoryWriteInputSchema,
  typeof MemoryWriteOutputSchema
> = {
  agent: 'memory',
  version: '1.0.0',
  domain: 'support',
  envelopeVersion: ENVELOPE_VERSION,
  input: MemoryWriteInputSchema,
  output: MemoryWriteOutputSchema,
  allowedTools: [],
  secrets: ['agent:memory:llm'],
  emits: [],
  timeoutMs: 20_000,
};
