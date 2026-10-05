import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import PasswordField from '../components/PasswordField';
import { friendlyAuthError } from '../lib/authErrors';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Only reachable from the emailed reset link, which signs the user in.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
    });
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      toast.success('Password saved');
      navigate('/');
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SEO title="Set a new password" description="Choose a new password for your Onium account." noIndex />
      <PageIntro title="Set a new password" lede="Choose a new password for your account." />

      <div className="container mx-auto px-4 py-10 md:py-14">
        <form onSubmit={handleSubmit} className="max-w-md grid gap-5">
          <PasswordField
            id="new-password"
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            hint="At least 6 characters."
          />
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
            {loading ? 'Saving…' : 'Save password'}
          </button>
        </form>
      </div>
    </div>
  );
}
