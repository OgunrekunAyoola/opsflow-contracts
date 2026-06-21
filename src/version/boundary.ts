/**
 * Envelope versioning + boundary validation (AGENT_CONTRACT_SPEC §5, TRANSFORMATION_PLAN §6.5).
 *
 * Agents emit an `AgentResult` stamped with an `envelopeVersion`. The orchestrator
 * validates that version at the boundary and accepts a compatibility window:
 * **same major, minor ≤ the orchestrator's current minor.** A different major, or a
 * newer minor than the orchestrator understands, is incompatible → the result is
 * rejected (ticket escalates, fail-closed).
 *
 * Rationale: breaking change = major bump (agents migrate on their own cadence);
 * additive change = minor bump (agents opt in). The orchestrator on minor N can
 * read any envelope of the same major with minor 0..N.
 */

/** The current envelope version this build of `@opsflow/contracts` emits. */
export const ENVELOPE_VERSION = '1.0';

export interface SemVerLite {
  major: number;
  minor: number;
}

export class EnvelopeVersionError extends Error {
  constructor(
    public readonly received: string,
    public readonly supported: string,
  ) {
    super(
      `Incompatible AgentResult envelopeVersion "${received}" — this orchestrator supports "${supported}" (same major, minor ≤ current).`,
    );
    this.name = 'EnvelopeVersionError';
  }
}

/** Parse "MAJOR.MINOR" (ignores any patch). Returns null if malformed. */
export function parseEnvelopeVersion(v: string): SemVerLite | null {
  const m = /^(\d+)\.(\d+)/.exec(v.trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]) };
}

/**
 * Is `received` compatible with `current` (default: this build's ENVELOPE_VERSION)?
 * Compatible ⇔ same major AND received.minor ≤ current.minor.
 */
export function isEnvelopeCompatible(received: string, current: string = ENVELOPE_VERSION): boolean {
  const r = parseEnvelopeVersion(received);
  const c = parseEnvelopeVersion(current);
  if (!r || !c) return false;
  return r.major === c.major && r.minor <= c.minor;
}

/** Throws `EnvelopeVersionError` if `received` is not compatible with `current`. */
export function assertEnvelopeCompatible(received: string, current: string = ENVELOPE_VERSION): void {
  if (!isEnvelopeCompatible(received, current)) {
    throw new EnvelopeVersionError(received, current);
  }
}
