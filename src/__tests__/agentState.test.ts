import { AgentStateSchema, TriageOutputSchema } from '../state/AgentState';
import { TRIAGE_PRIORITIES, REQUEST_SCOPES } from '../enums';

describe('AgentState schema (translated, enum-backed)', () => {
  test('parses a minimal valid state and applies defaults', () => {
    const parsed = AgentStateSchema.parse({
      ticketId: 't1',
      tenantId: 'tn1',
      ticket: { subject: 's', body: 'b', channel: 'whatsapp', customerId: 'c1' },
      tenantConfig: {},
    });
    expect(parsed.auditTrail).toEqual([]);
    expect(parsed.customerFacts).toEqual([]);
    expect(parsed.tenantConfig.qualityThreshold).toBe(70);
    expect(parsed.ticket.messages).toEqual([]);
  });

  test('rejects an out-of-vocabulary channel', () => {
    expect(() =>
      AgentStateSchema.parse({
        ticketId: 't1',
        tenantId: 'tn1',
        ticket: { subject: 's', body: 'b', channel: 'carrier_pigeon', customerId: 'c1' },
        tenantConfig: {},
      }),
    ).toThrow();
  });

  test('triage priority + request scope are backed by the shared enums', () => {
    const out = TriageOutputSchema.parse({
      category: 'shipping',
      sentiment: 'neutral',
      priority: 'emergency',
    });
    expect(TRIAGE_PRIORITIES).toContain(out.priority);
    expect(out.requestScope).toBe('unsure'); // default
    expect(REQUEST_SCOPES).toContain(out.requestScope);
  });
});
