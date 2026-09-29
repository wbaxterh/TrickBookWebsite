import { getRecoveryMessage, recoveryUrl } from '../authRecovery';

describe('getRecoveryMessage', () => {
  it('names the provider the account was created with', () => {
    expect(getRecoveryMessage('apple')).toContain('Sign in with Apple');
    expect(getRecoveryMessage('google')).toContain('Sign in with Google');
    expect(getRecoveryMessage('password')).toContain('email and password');
  });

  it('falls back to a generic message for an unknown provider', () => {
    expect(getRecoveryMessage('magic-link')).toMatch(/could not confirm/);
    expect(getRecoveryMessage(undefined)).toMatch(/could not confirm/);
  });
});

describe('recoveryUrl', () => {
  it('carries the provider only when it is one we know', () => {
    expect(recoveryUrl('google')).toBe('/login?error=provider_mismatch&provider=google');
    expect(recoveryUrl('nope')).toBe('/login?error=provider_mismatch');
    expect(recoveryUrl(null)).toBe('/login?error=provider_mismatch');
  });
});
