import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import Field from '../components/Field';
import PasswordField from '../components/PasswordField';
import { friendlyAuthError } from '../lib/authErrors';

export default function Login() {
  const location = useLocation();
  // The welcome offer links here ready to sign up.
  const [isSignUp, setIsSignUp] = useState(() => Boolean((location.state as { signUp?: boolean } | null)?.signUp));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  const navigate = useNavigate();
  // Where to go afterwards: checkout passes itself along; otherwise home.
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: { data: { full_name: form.fullName.trim() } },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          toast.success('Account created. Welcome to Onium.');
          navigate(from, { replace: true });
        } else {
          setAwaitingConfirmation(true);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (signInError) throw signInError;
        toast.success('Welcome back');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (awaitingConfirmation) {
    return (
      <div>
        <SEO title="Check your email" noIndex />
        <PageIntro title="Check your email" lede={`We sent a link to ${form.email.trim()}. Open it to confirm your account.`} />
        <div className="container mx-auto px-4 py-10">
          <Link to="/" className="inline-flex items-center min-h-12 px-6 rounded-full border border-ink/15 text-ink font-semibold hover:bg-white transition-colors">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEO title={isSignUp ? 'Create an account' : 'Log in'} description="Log in to your Onium account." noIndex />
      <PageIntro
        title={isSignUp ? 'Create an account' : 'Log in'}
        lede={
          isSignUp
            ? 'Get 10% off your first order with code WELCOME10, and check out faster.'
            : 'Use your account to apply discount codes and check out faster.'
        }
      />

      <div className="container mx-auto px-4 py-10 md:py-14">
        <form onSubmit={handleSubmit} className="max-w-md grid gap-5">
          {isSignUp && (
            <Field id="auth-name" label="Full name">
              {(props) => (
                <input
                  {...props}
                  type="text"
                  required
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              )}
            </Field>
          )}
          <Field id="auth-email" label="Email">
            {(props) => (
              <input
                {...props}
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            )}
          </Field>
          <PasswordField
            id="auth-password"
            label="Password"
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            hint={isSignUp ? 'At least 6 characters.' : undefined}
          />

          {!isSignUp && (
            <Link to="/forgot-password" className="justify-self-start -mt-2 inline-flex items-center min-h-11 text-sm font-semibold text-primary-700 hover:underline underline-offset-4">
              Forgot your password?
            </Link>
          )}

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
            {loading ? (isSignUp ? 'Creating account…' : 'Logging in…') : isSignUp ? 'Create account' : 'Log in'}
          </button>

          <p className="text-[15px] text-ink/70">
            {isSignUp ? 'Already have an account?' : 'New to Onium?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="inline-flex items-center min-h-11 font-semibold text-primary-700 underline underline-offset-4"
            >
              {isSignUp ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
