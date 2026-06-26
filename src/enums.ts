import { z } from 'zod';

/**
 * Shared enums — the single source of truth for OpsFlow's cross-cutting vocabulary.
 * Every repo imports these instead of redefining them (closes the drift class
 * D-V1 / N-49 / N-51). Each enum is exported three ways: a `const` tuple (for
 * iteration / Mongoose enum lists), a zod schema (for validation), and an inferred
 * union type (for TypeScript). Config VALUES (e.g. per-tier caps) are NOT here —
 * those belong to `platform`; this file owns only the vocabulary.
 */

// Subscription tier (the list only; per-tier caps live in platform's tier config)
export const TIER_IDS = ['starter', 'growth', 'enterprise'] as const;
export const TierEnum = z.enum(TIER_IDS);
export type Tier = z.infer<typeof TierEnum>;

// Ticket lifecycle status (ingestion + resolution)
export const TICKET_STATUSES = [
  'new',
  'triaging',
  'triaged',
  'awaiting_reply',
  'replied',
  'waiting_on_customer',
  'auto_resolved',
  'resolved',
  'closed',
] as const;
export const TicketStatusEnum = z.enum(TICKET_STATUSES);
export type TicketStatus = z.infer<typeof TicketStatusEnum>;

// Ticket priority (the stored/ingestion field)
export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const TicketPriorityEnum = z.enum(TICKET_PRIORITIES);
export type TicketPriority = z.infer<typeof TicketPriorityEnum>;

// Triage priority (pipeline judgment — note 'emergency', mapped to urgent on write)
export const TRIAGE_PRIORITIES = ['low', 'medium', 'high', 'emergency'] as const;
export const TriagePriorityEnum = z.enum(TRIAGE_PRIORITIES);
export type TriagePriority = z.infer<typeof TriagePriorityEnum>;

// Escalation urgency (queue tiering)
export const ESCALATION_URGENCIES = ['low', 'medium', 'high', 'emergency'] as const;
export const EscalationUrgencyEnum = z.enum(ESCALATION_URGENCIES);
export type EscalationUrgency = z.infer<typeof EscalationUrgencyEnum>;

// Channel
export const CHANNELS = ['email', 'whatsapp', 'web_form', 'integration'] as const;
export const ChannelEnum = z.enum(CHANNELS);
export type Channel = z.infer<typeof ChannelEnum>;

// Consent status (NDPC)
export const CONSENT_STATUSES = ['granted', 'revoked', 'pending'] as const;
export const ConsentStatusEnum = z.enum(CONSENT_STATUSES);
export type ConsentStatus = z.infer<typeof ConsentStatusEnum>;

// Quality gate (the auto-send decision)
export const QUALITY_GATES = ['auto_send', 'human_review', 'escalate'] as const;
export const QualityGateEnum = z.enum(QUALITY_GATES);
export type QualityGate = z.infer<typeof QualityGateEnum>;

// Routing decision (the orchestrator's authoritative next-path).
// `inform` = the INFORM flow: answer a relationship/overview question (greetings, "what do you
// sell?", hours) from the business overview, then run the quality gate (EXECUTION_PIPELINE_ROUTING_DESIGN).
export const ROUTING_DECISIONS = ['automate', 'escalate', 'human', 'decline', 'inform'] as const;
export const RoutingDecisionEnum = z.enum(ROUTING_DECISIONS);
export type RoutingDecision = z.infer<typeof RoutingDecisionEnum>;

// User role (RBAC)
export const ROLES = ['admin', 'support_agent'] as const;
export const RoleEnum = z.enum(ROLES);
export type Role = z.infer<typeof RoleEnum>;

// HITL approval lifecycle (G2)
export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'expired'] as const;
export const ApprovalStatusEnum = z.enum(APPROVAL_STATUSES);
export type ApprovalStatus = z.infer<typeof ApprovalStatusEnum>;

export const APPROVAL_TYPES = ['outbound_response'] as const;
export const ApprovalTypeEnum = z.enum(APPROVAL_TYPES);
export type ApprovalType = z.infer<typeof ApprovalTypeEnum>;

// Sentiment
export const SENTIMENTS = ['positive', 'neutral', 'negative', 'very_negative'] as const;
export const SentimentEnum = z.enum(SENTIMENTS);
export type Sentiment = z.infer<typeof SentimentEnum>;

// Detected language (EN + Nigerian languages + FR)
export const LANGUAGES = ['en', 'pcm', 'yo', 'ig', 'ha', 'fr'] as const;
export const LanguageEnum = z.enum(LANGUAGES);
export type Language = z.infer<typeof LanguageEnum>;

// Thread state machine (ADR-059/060/061)
export const THREAD_STATES = [
  'idle',
  'active',
  'pending_customer',
  'pending_vendor',
  'pending_human',
  'resolved',
] as const;
export const ThreadStateEnum = z.enum(THREAD_STATES);
export type ThreadState = z.infer<typeof ThreadStateEnum>;

// Message classification (thread classifier)
export const MESSAGE_CLASSIFICATIONS = [
  'continuation',
  'new_ticket',
  'reopen',
  'topic_switch',
  'human_queue_addition',
] as const;
export const MessageClassificationEnum = z.enum(MESSAGE_CLASSIFICATIONS);
export type MessageClassification = z.infer<typeof MessageClassificationEnum>;

// Request scope (PRODUCT_AVAILABILITY_AND_SCOPE_DESIGN)
export const REQUEST_SCOPES = ['in', 'out', 'unsure'] as const;
export const RequestScopeEnum = z.enum(REQUEST_SCOPES);
export type RequestScope = z.infer<typeof RequestScopeEnum>;

// Commerce intent (VENDOR_SUPPORT_DOMAIN_CAPABILITY_MAP) — the customer's job-to-be-done, which
// lets the pipeline route to convert vs. resolve vs. recover. ORTHOGONAL to two other axes, by
// design: `category` says "what topic", `requestScope` (in/out/unsure) says "is this ours", and
// this says "what stage of the buying relationship". An out-of-scope-but-real product question is
// `discovery` + scope `out` — NOT `noise` (which is reserved for genuine junk), so we can still
// decline-and-redirect a real customer instead of treating them as spam.
export const COMMERCE_INTENTS = [
  'discovery', // pre-purchase: availability, price, specs, "do you have X" (even if scope=out)
  'purchase', // intent to buy / order / pay-now
  'payment', // a payment/refund matter (money — fail-closed downstream)
  'fulfillment', // post-purchase: order status, delivery, address change
  'problem', // service recovery: broken/wrong item, returns, complaints
  'relationship', // greetings, hours/location, thanks, reviews
  'compliance', // opt-out, data requests
  'noise', // genuine junk ONLY: spam, gibberish, not a real request (NOT out-of-scope → that's scope=out)
] as const;
export const CommerceIntentEnum = z.enum(COMMERCE_INTENTS);
export type CommerceIntent = z.infer<typeof CommerceIntentEnum>;
