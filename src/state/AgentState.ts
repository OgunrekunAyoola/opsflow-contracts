import { z } from 'zod';
import {
  ChannelEnum,
  SentimentEnum,
  TriagePriorityEnum,
  RequestScopeEnum,
  RoutingDecisionEnum,
  QualityGateEnum,
  ThreadStateEnum,
  MessageClassificationEnum,
} from '../enums';

/**
 * AgentState — the canonical pipeline state schema (translated from the monolith's
 * core/graph/AgentState.ts). Contracts owns the SCHEMA + inferred types; the
 * LangGraph `Annotation.Root` (a runtime-graph concern) stays in `pipelines` and
 * is built FROM these types. No `@langchain/langgraph` dependency here — contracts
 * is pure types + zod.
 *
 * Agents do NOT receive the whole AgentState (AGENT_CONTRACT_SPEC §2): the
 * orchestrator passes each agent an explicit context slice per its contract.input.
 * This schema is the superset the orchestrator owns and slices from.
 */

// ── Leaf schemas ──────────────────────────────────────────────────────────────

export const MessageSchema = z.object({
  role: z.enum(['customer', 'agent', 'ai']),
  content: z.string(),
  sentAt: z.date(),
});

export const TicketSchema = z.object({
  subject: z.string(),
  body: z.string(),
  channel: ChannelEnum,
  customerId: z.string(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  messages: z.array(MessageSchema).default([]),
});

export const TenantConfigSchema = z.object({
  escalationRequiredList: z.array(z.string()).default([]),
  qualityThreshold: z.number().default(70),
  approvalThreshold: z.number().default(85),
  maxToolAttempts: z.number().default(3),
  brandVoicePrompt: z.string().optional(),
  prohibitedTopics: z.array(z.string()).default([]),
  rateLimits: z
    .object({
      ticketsPerMinute: z.number().default(60),
      llmCallsPerMinute: z.number().default(120),
    })
    .default(() => ({ ticketsPerMinute: 60, llmCallsPerMinute: 120 })),
});

export const TriageOutputSchema = z.object({
  category: z.string(),
  sentiment: SentimentEnum,
  priority: TriagePriorityEnum,
  detectedLanguage: z.string().default('en'),
  isDistressed: z.boolean().default(false),
  isOptOut: z.boolean().default(false),
  productIntent: z.boolean().default(false),
  requestScope: RequestScopeEnum.default('unsure'),
  productSearchTerms: z.array(z.string()).default([]),
  confidence: z.number().optional(),
  reasoning: z.string().optional(),
});

export const EnrichmentSchema = z.object({
  customerTier: z.enum(['standard', 'vip', 'new']),
  priorTicketCount: z.number().default(0),
  priorEscalationCount: z.number().default(0),
  customerId: z.string(),
  canonicalCustomerId: z.string().optional(),
});

export const RAGContextItemSchema = z.object({
  found: z.boolean(),
  confidence: z.number(),
  layer: z.enum(['layer1', 'layer2', 'layer3', 'none']),
  result: z.any(),
  dataFreshnessAge: z.number().default(0),
  freshnessStatus: z.enum(['fresh', 'recent', 'stale', 'very_stale', 'unknown']).default('unknown'),
  requiresVendorVerification: z.boolean().default(false),
  requiresEscalation: z.boolean().default(false),
});

export const ToolResultSchema = z.object({
  toolName: z.string(),
  invocationId: z.string().optional(),
  attemptNumber: z.number(),
  input: z.record(z.string(), z.any()),
  output: z.any().optional(),
  success: z.boolean(),
  error: z.string().optional(),
  retryable: z.boolean().optional(),
  latencyMs: z.number().optional(),
});

export const QualityScoreSchema = z.object({
  score: z.number(),
  gate: QualityGateEnum,
  reasoning: z.string(),
});

export const MemorySchema = z.object({
  keyFacts: z.array(z.string()).default([]),
  preferredChannel: z.string().optional(),
  preferredTone: z.string().optional(),
  resolvedCategories: z.array(z.string()).default([]),
  openIssues: z.array(z.string()).default([]),
});

export const AuditEventSchema = z.object({
  agent: z.string(),
  action: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const AgentErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  agent: z.string(),
});

export const PaymentContextSchema = z.object({
  type: z.enum([
    'none',
    'billing_inquiry',
    'payment_claim',
    'billing_dispute',
    'refund_request',
    'payment_failure',
  ]),
  requiresHuman: z.boolean(),
  confidence: z.number(),
  extractedAmount: z.string().optional(),
  extractedMethod: z.string().optional(),
  extractedReference: z.string().optional(),
  matchedPatterns: z.array(z.string()),
});

export const HandbackContextSchema = z.object({
  handoffId: z.string(),
  resolvedAspects: z.array(z.string()),
  unresolvedAspects: z.array(z.string()),
  humanMessages: z.array(MessageSchema),
  aiInstruction: z.string(),
  reEscalationAllowed: z.boolean(),
});

// ── Root AgentState schema ────────────────────────────────────────────────────

export const AgentStateSchema = z.object({
  // Identity
  ticketId: z.string(),
  tenantId: z.string(),
  threadId: z.string().optional(),

  // Raw input
  ticket: TicketSchema,

  // Tenant configuration (loaded at orchestrator entry)
  tenantConfig: TenantConfigSchema,

  // Thread context (set by ThreadClassifier)
  threadState: ThreadStateEnum.optional(),
  messageClassification: MessageClassificationEnum.optional(),
  threadSummary: z.string().optional(),
  customerFacts: z.array(z.string()).default([]),
  isReopen: z.boolean().default(false),
  isFirstContact: z.boolean().default(false),
  priorTicketId: z.string().optional(),

  // Agent outputs (populated progressively)
  triageOutput: TriageOutputSchema.optional(),
  routingDecision: RoutingDecisionEnum.optional(),
  routingReason: z.string().optional(),
  enrichment: EnrichmentSchema.optional(),
  ragContext: z.array(RAGContextItemSchema).optional(),
  toolResults: z.array(ToolResultSchema).optional(),
  draftResponse: z.string().optional(),
  qualityScore: QualityScoreSchema.optional(),
  memory: MemorySchema.optional(),
  escalationReason: z.string().optional(),

  // Payment signal (set pre-LLM, used by the router)
  paymentContext: PaymentContextSchema.optional(),

  // Handback context (set when a human hands a ticket back to the AI)
  handbackContext: HandbackContextSchema.optional(),

  // Append-only audit trail — every agent appends its own events
  auditTrail: z.array(AuditEventSchema).default([]),

  error: AgentErrorSchema.optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type AgentState = z.infer<typeof AgentStateSchema>;
export type AgentMessage = z.infer<typeof MessageSchema>;
export type TicketInput = z.infer<typeof TicketSchema>;
export type TenantConfig = z.infer<typeof TenantConfigSchema>;
export type TriageOutput = z.infer<typeof TriageOutputSchema>;
export type EnrichmentResult = z.infer<typeof EnrichmentSchema>;
export type RAGContextItem = z.infer<typeof RAGContextItemSchema>;
export type ToolResult = z.infer<typeof ToolResultSchema>;
export type QualityScore = z.infer<typeof QualityScoreSchema>;
export type AgentMemory = z.infer<typeof MemorySchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AgentStateError = z.infer<typeof AgentErrorSchema>;
export type PaymentContext = z.infer<typeof PaymentContextSchema>;
export type HandbackContext = z.infer<typeof HandbackContextSchema>;
