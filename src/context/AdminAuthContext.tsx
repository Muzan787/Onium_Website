import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Define our own simple Admin User type
interface AdminUser {
  id: string;
  email: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The storefront and the admin panel now live on the same origin, so they
  // share a single Supabase session. A plain "is there a session?" check is no
  // longer enough: a signed-in customer would pass it. Every session we see
  // has to be checked against the 'admins' whitelist before it counts as admin.
  const resolveAdmin = useCallback(async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
    const email = session?.user?.email;

    if (!session?.user || !email) {
      setUser(null);
      return;
    }

    const { data: adminData, error } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (error || !adminData) {
      // A real session, but not an admin one (e.g. a logged-in customer).
      // Leave their storefront session alone and simply grant no admin access.
      setUser(null);
      return;
    }

    setUser({ id: session.user.id, email });
  }, []);

  useEffect(() => {
    let isActive = true;

    // 1. Check for an active session on initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await resolveAdmin(session);
      if (isActive) setIsLoading(false);
    });

    // 2. Listen for auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        await resolveAdmin(session);
        if (isActive) setIsLoading(false);
      })();
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [resolveAdmin]);

  const signIn = async (email: string, password: string) => {
    try {
      // 1. Authenticate with Supabase Auth (Secure)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { error: authError.message };
      }

      // 2. Check the 'admins' whitelist. This runs as the freshly signed-in
      // user rather than anonymously, so it keeps working if the 'admins'
      // table is later locked down to authenticated reads only.
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, email')
        .eq('email', authData.user?.email ?? email)
        .maybeSingle();

      if (adminError || !adminData) {
        // Signed in, but not on the whitelist -> drop the session again.
        await supabase.auth.signOut();
        return { error: 'Not an authorized admin' };
      }

      // Success: The onAuthStateChange listener above will update the state
      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: 'Login failed' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
