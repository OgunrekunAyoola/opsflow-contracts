import type { DomainEventName } from './names';

/**
 * One payload interface per DomainEventName (ADR-076). Emitters and subscribers
 * share these types. `DomainEventPayloads` maps each name → its payload so the
 * event bus can be fully typed at the boundary.
 */

export interface TicketCreatedPayload {
  ticketId: string;
  tenantId: string;
  channel: string;
  customerId: string;
  subject: string;
}

export interface TicketResolvedPayload {
  ticketId: string;
  tenantId: string;
  resolvedBy: 'ai' | 'human';
  threadId?: string;
}

export interface TicketEscalatedPayload {
  ticketId: string;
  handoffId: string;
  tenantId: string;
  reason:
    | 'distressed_customer'
    | 'negative_high_priority'
    | 'tool_failure_3x'
    | 'payment_required'
    | 'manual';
  urgency: 'emergency' | 'high' | 'medium' | 'low';
  customerId: string;
  channel: string;
  channelAddress?: string;
  customerTier?: string;
  score: number;
}

export interface PaymentConfirmedPayload {
  ticketId: string;
  tenantId: string;
  orderId: string;
  reference: string;
  gateway: 'paystack' | 'flutterwave';
  amountKobo?: number;
}

export interface CustomerOptedOutPayload {
  tenantId: string;
  canonicalId: string;
  channel: string;
  channelAddress: string;
}

export interface DistressDetectedPayload {
  ticketId: string;
  tenantId: string;
  customerId: string;
  channel: string;
  channelAddress?: string;
  signals: string[];
}

export interface BudgetExceededPayload {
  tenantId: string;
  tier: string;
  dailyCapUsd: number;
  spentUsd: number;
}

export interface ThreadStateTransitionedPayload {
  threadId: string;
  tenantId: string;
  fromState: string;
  toState: string;
  ticketId?: string;
}

export interface ToolCalledPayload {
  ticketId: string;
  tenantId: string;
  toolName: string;
  success: boolean;
  invocationId: string;
  errorCode?: string;
}

export interface LLMCallCompletedPayload {
  tenantId: string;
  ticketId?: string;
  agentId: string;
  task: string;
  provider: 'anthropic' | 'gemini';
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalCostUsd: number;
  degraded: boolean;
}

/** name → payload map, so the event bus + subscribers are typed end-to-end. */
export interface DomainEventPayloads extends Record<DomainEventName, unknown> {
  TicketCreated: TicketCreatedPayload;
  TicketResolved: TicketResolvedPayload;
  TicketEscalated: TicketEscalatedPayload;
  PaymentConfirmed: PaymentConfirmedPayload;
  CustomerOptedOut: CustomerOptedOutPayload;
  DistressDetected: DistressDetectedPayload;
  BudgetExceeded: BudgetExceededPayload;
  ThreadStateTransitioned: ThreadStateTransitionedPayload;
  ToolCalled: ToolCalledPayload;
  LLMCallCompleted: LLMCallCompletedPayload;
}
