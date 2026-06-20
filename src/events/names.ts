/** Domain event names (ADR-076). The single source for the event vocabulary. */
export const DOMAIN_EVENT_NAMES = [
  'TicketCreated',
  'TicketResolved',
  'TicketEscalated',
  'PaymentConfirmed',
  'CustomerOptedOut',
  'DistressDetected',
  'BudgetExceeded',
  'ThreadStateTransitioned',
  'ToolCalled',
  'LLMCallCompleted',
] as const;

export type DomainEventName = (typeof DOMAIN_EVENT_NAMES)[number];
