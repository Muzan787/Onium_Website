import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import Field from '../components/Field';
import { friendlyAuthError } from '../lib/authErrors';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SEO title="Reset your password" description="Reset the password for your Onium account." noIndex />
      <PageIntro
        title={sent ? 'Check your email' : 'Reset your password'}
        lede={
          sent
            ? `If there's an account for ${email.trim()}, a link to set a new password is on its way.`
            : "Enter your email and we'll send you a link to set a new one."
        }
      />

      <div className="container mx-auto px-4 py-10 md:py-14">
        {sent ? (
          <Link
            to="/login"
            className="inline-flex items-center min-h-12 px-6 rounded-full border border-ink/15 text-ink font-semibold hover:bg-white transition-colors"
          >
            Back to log in
          </Link>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md grid gap-5">
            <Field id="reset-email" label="Email">
              {(props) => (
                <input {...props} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              )}
            </Field>
            {error && (
              <p role="alert" className="rounded-2xl bg-clay-50 px-5 py-4 text-[15px] font-medium text-clay-800">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="min-h-[52px] rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-70 transition-colors"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <Link to="/login" className="justify-self-start inline-flex items-center min-h-11 text-sm font-semibold text-primary-700 hover:underline underline-offset-4">
              Back to log in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
