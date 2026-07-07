/**
 * DomainPack — the domain-abstraction boundary (EXECUTION_PLAN §3.1 / SYSTEM_AUDIT §2.2).
 *
 * Everything domain-specific about a vertical (what the assistant is, which facts ground it, which
 * phrases fence it, which claims its output gate holds, how it discloses itself per language) is a
 * MEMBER of this interface. The conversation engine takes a pack as a dependency and stays
 * domain-blind; adding a vertical = registering a new pack, touching zero engine files.
 *
 * Deliberately NOT here: tools/tenant scoping. Tools are built by the PLATFORM's
 * `buildToolsHandle(tenantId, …)` — a pack receives a pre-scoped handle and exposes no
 * tenant-scoping surface, so a pack cannot widen isolation (EXECUTION_PLAN §3.2 invariant).
 */

/** Languages served (NDPC disclosure + fence locales). */
export type DomainLang = 'en' | 'pcm' | 'yo' | 'ig' | 'ha';

/**
 * The deterministic output-gate pattern set for the domain. The gate LOGIC (hold vs send) is
 * engine-level; the pack supplies only the pattern DATA.
 */
export interface DomainGatePatterns {
  /** First-person assertions that a payment was received/confirmed (ADR-068 — never sendable). */
  paymentAssertion: RegExp[];
  /** First-person commitments to execute a money action ("I will refund you"). */
  moneyCommitment: RegExp[];
  /** First-person commitments the domain cannot keep (e.g. reserving stock). */
  reservationCommitment: RegExp[];
  /** Trust/authenticity/condition claims that require domain-authored backing to render. */
  trustClaims: RegExp[];
  /** Matches a money amount in a reply — every match must trace to the turn's source set. */
  moneyAmount: RegExp;
}

export interface DomainFence {
  /** Deterministic opt-out detection (NDPC) — runs before any LLM call. */
  isOptOut(message: string): boolean;
  /** Deterministic hard-distress detection — runs before any LLM call. */
  isHardDistress(message: string): boolean;
}

export interface DomainLocale {
  /** Best-effort language detection from the customer's message (defaults to 'en'). */
  detectLang(message: string): DomainLang;
  /** The NDPC AI-disclosure line for a language (N-25) — sent on first contact. */
  disclosure(lang: DomainLang): string;
}

export interface DomainPack<TFacts = unknown> {
  /** Stable id, e.g. 'vendor_support'. `Tenant.domain` resolves against this. */
  id: string;
  /** Resolve the tenant's grounding facts (the pack receives the id; scoping stays platform-side). */
  resolveFacts(tenantId: string): Promise<TFacts>;
  /** Readiness gate (S-05): false ⇒ the AI must not answer live customers for this tenant. */
  readiness(facts: TFacts): boolean;
  /** The driver's system prompt for this domain. */
  buildSystemPrompt(facts: TFacts, tenantName: string): string;
  /** The grounded fact lines — also the output gate's verification source set. */
  buildFactLines(facts: TFacts): string[];
  fence: DomainFence;
  gate: DomainGatePatterns;
  /** Vendor-facing display labels for the domain's tool names. */
  toolLabels: Record<string, string>;
  locale: DomainLocale;
  /** Path of the behavioural eval corpus that validates this pack (repo-relative). */
  evalCorpus: string;
}
