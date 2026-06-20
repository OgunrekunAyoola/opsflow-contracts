import { packageResult, type AgentResult } from '../agent/AgentResult';
import { ENVELOPE_VERSION } from '../version/boundary';

describe('packageResult (validate_and_package helper)', () => {
  test('produces a complete envelope with safe empties', () => {
    const r: AgentResult<{ draft: string }> = packageResult({
      agent: 'resolution',
      agentVersion: '0.1.0',
      status: 'ok',
      output: { draft: 'hello' },
      correlationId: 'corr-1',
      startedAt: 1000,
      finishedAt: 1250,
    });

    expect(r.envelopeVersion).toBe(ENVELOPE_VERSION);
    expect(r.output).toEqual({ draft: 'hello' });
    expect(r.validation).toEqual({ selfValidated: false, checks: [] });
    expect(r.toolCalls).toEqual([]);
    expect(r.cost).toEqual({ llmUsd: 0, tokens: { in: 0, out: 0 } });
    expect(r.audit).toEqual([]);
    expect(r.timing.durationMs).toBe(250);
    expect(r.timing.startedAt).toBe(new Date(1000).toISOString());
    expect(r.correlationId).toBe('corr-1');
  });

  test('carries through provided records, confidence, next, and error', () => {
    const r = packageResult({
      agent: 'triage',
      agentVersion: '0.1.0',
      status: 'error',
      output: null,
      correlationId: 'c',
      startedAt: 0,
      finishedAt: 5,
      confidence: 0.4,
      next: 'escalation',
      toolCalls: [{ tool: 'check_order_status', ok: true, latencyMs: 12 }],
      cost: { llmUsd: 0.002, tokens: { in: 100, out: 20 } },
      audit: [{ action: 'triage_failed' }],
      error: { code: 'LLM_TIMEOUT', message: 'timed out', retryable: true },
      validation: { selfValidated: true, checks: [{ name: 'schema', passed: true }] },
    });

    expect(r.status).toBe('error');
    expect(r.confidence).toBe(0.4);
    expect(r.next).toBe('escalation');
    expect(r.toolCalls).toHaveLength(1);
    expect(r.cost.llmUsd).toBeCloseTo(0.002);
    expect(r.error?.retryable).toBe(true);
    expect(r.validation.selfValidated).toBe(true);
  });

  test('duration never goes negative on clock skew', () => {
    const r = packageResult({
      agent: 'memory', agentVersion: '0.1.0', status: 'ok', output: {},
      correlationId: 'c', startedAt: 100, finishedAt: 50,
    });
    expect(r.timing.durationMs).toBe(0);
  });
});
