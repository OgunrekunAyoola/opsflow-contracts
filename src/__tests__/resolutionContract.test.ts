/**
 * Resolution agent contract + selfValidate (P4 / M1) — the first first-class agent contract.
 */
import {
  resolutionContract,
  ResolutionInputSchema,
  ResolutionOutputSchema,
  selfValidate,
  ENVELOPE_VERSION,
} from '../index';

const validToolResult = { toolName: 'kb_lookup', attemptNumber: 1, input: {}, success: true };
const validTicket = { subject: 's', body: 'b', channel: 'email', customerId: 'c1' };

describe('resolutionContract', () => {
  it('has the expected first-class-agent shape', () => {
    expect(resolutionContract.agent).toBe('resolution');
    expect(resolutionContract.version).toBeTruthy();
    expect(resolutionContract.envelopeVersion).toBe(ENVELOPE_VERSION);
    expect(resolutionContract.allowedTools.length).toBeGreaterThan(0);
    expect(resolutionContract.secrets).toContain('agent:resolution:llm');
  });

  it('ResolutionInputSchema accepts a valid slice and rejects bad input', () => {
    expect(ResolutionInputSchema.safeParse({ ticket: validTicket, maxToolAttempts: 3 }).success).toBe(true);
    expect(ResolutionInputSchema.safeParse({ maxToolAttempts: 3 }).success).toBe(false); // no ticket
    expect(ResolutionInputSchema.safeParse({ ticket: validTicket, maxToolAttempts: 0 }).success).toBe(false); // not positive
  });

  it('ResolutionOutputSchema requires toolResults and validates routingDecision', () => {
    expect(ResolutionOutputSchema.safeParse({ toolResults: [validToolResult] }).success).toBe(true);
    expect(ResolutionOutputSchema.safeParse({ toolResults: [], routingDecision: 'escalate' }).success).toBe(
      true,
    );
    expect(ResolutionOutputSchema.safeParse({ toolResults: [], routingDecision: 'nope' }).success).toBe(
      false,
    );
    expect(ResolutionOutputSchema.safeParse({}).success).toBe(false); // toolResults required
  });

  it('selfValidate passes for valid output and fails with detail for invalid', () => {
    const ok = selfValidate(resolutionContract, { toolResults: [validToolResult] });
    expect(ok.selfValidated).toBe(true);
    expect(ok.checks[0]?.passed).toBe(true);

    const bad = selfValidate(resolutionContract, { toolResults: 'not-an-array' });
    expect(bad.selfValidated).toBe(false);
    expect(bad.checks[0]?.passed).toBe(false);
    expect(bad.checks[0]?.detail).toBeTruthy();
  });
});
