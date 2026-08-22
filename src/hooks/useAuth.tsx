import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AppRole = 'CO' | 'S1' | 'S4' | 'S4_ADMIN' | 'OC' | 'SQMS' | 'STOREMAN' | 'Soldier' | 'MTO' | 'WKSP_WO' | 'RSM';

interface Profile {
  id: string;
  name: string;
  rank: string | null;
  unit_id: string | null;
  contact: string | null;
  service_number: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, rank: string, role: AppRole, unit_id: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setPin: (pin: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile and role separately using setTimeout to avoid deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch role (only approved roles)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .single();

      if (roleError) {
        console.log('No approved role assigned yet');
        setRole(null);
      } else {
        setRole(roleData.role as AppRole);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      navigate('/');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, rank: string, role: AppRole, unit_id: string) => {
    const redirectUrl = `${window.location.origin}/`;

    if (!unit_id) {
      return { error: { message: 'Unit selection is required' } };
    }

    // name, rank, unit_id, and role are all passed as user metadata and
    // consumed by the handle_new_user() trigger (SECURITY DEFINER), which
    // creates the profile and pending role request atomically. This avoids
    // depending on an authenticated client session immediately after
    // signUp() — which doesn't exist yet when email confirmation is
    // required, causing RLS to reject any follow-up client-side writes.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          rank,
          unit_id,
          role,
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }

    if (!data.user) {
      return { error: { message: 'User creation failed' } };
    }

    return { error: null };
  };

  const setPin = async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      return { error: { message: 'PIN must be exactly 6 digits' } };
    }
    if (!user) {
      return { error: { message: 'Not signed in' } };
    }

    const { error: authError } = await supabase.auth.updateUser({ password: pin });
    if (authError) {
      return { error: authError };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ pin_enabled: true })
      .eq('id', user.id);

    if (profileError) {
      return { error: profileError };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('sensitive_unlocked');
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        setPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
