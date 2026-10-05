/** Supabase's auth messages are written for developers; these are for customers. */
export function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (/failed to fetch|network/i.test(message)) return "Couldn't reach Onium. Check your connection and try again.";
  if (/invalid login credentials/i.test(message)) return "That email and password don't match. Try again, or reset your password.";
  if (/already registered/i.test(message)) return 'There is already an account with that email. Log in instead.';
  if (/email not confirmed/i.test(message)) return 'Confirm your email first. The link is in the email we sent you.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Wait a minute, then try again.';
  if (/password should be/i.test(message)) return 'Choose a password of at least 6 characters.';
  return message || 'Something went wrong. Try again.';
}
