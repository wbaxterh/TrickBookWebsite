export const providerLabels = {
  apple: 'Sign in with Apple',
  google: 'Sign in with Google',
  password: 'Sign in with email and password',
};

export function getRecoveryMessage(provider) {
  const label = providerLabels[provider];
  if (!label) {
    return 'We could not confirm how this account was created. Try your usual sign-in method or reset your password.';
  }
  return `This account was created using ${label}. Please use that method to continue.`;
}

export function recoveryUrl(provider) {
  const params = new URLSearchParams({ error: 'provider_mismatch' });
  if (providerLabels[provider]) params.set('provider', provider);
  return `/login?${params.toString()}`;
}
