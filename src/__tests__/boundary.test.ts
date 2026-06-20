import {
  ENVELOPE_VERSION,
  isEnvelopeCompatible,
  assertEnvelopeCompatible,
  parseEnvelopeVersion,
  EnvelopeVersionError,
} from '../version/boundary';

describe('envelope boundary versioning', () => {
  test('current version is compatible with itself', () => {
    expect(isEnvelopeCompatible(ENVELOPE_VERSION)).toBe(true);
  });

  test('same major, older minor is compatible', () => {
    expect(isEnvelopeCompatible('1.0', '1.3')).toBe(true);
  });

  test('same major, newer minor than current is NOT compatible', () => {
    expect(isEnvelopeCompatible('1.4', '1.0')).toBe(false);
  });

  test('different major is NOT compatible', () => {
    expect(isEnvelopeCompatible('2.0', '1.0')).toBe(false);
    expect(isEnvelopeCompatible('0.9', '1.0')).toBe(false);
  });

  test('patch suffix is ignored', () => {
    expect(isEnvelopeCompatible('1.0.7', '1.0')).toBe(true);
  });

  test('malformed versions are not compatible', () => {
    expect(isEnvelopeCompatible('garbage')).toBe(false);
    expect(parseEnvelopeVersion('x.y')).toBeNull();
  });

  test('assertEnvelopeCompatible throws on mismatch', () => {
    expect(() => assertEnvelopeCompatible('2.0', '1.0')).toThrow(EnvelopeVersionError);
    expect(() => assertEnvelopeCompatible('1.0', '1.0')).not.toThrow();
  });
});
