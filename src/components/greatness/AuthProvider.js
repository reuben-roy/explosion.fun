'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabase } from '@/config/supabase';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  }, []);

  const fetchGoals = useCallback(async (userId) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at');
    setGoals(data || []);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchGoals(session.user.id),
        ]).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchGoals(session.user.id),
        ]).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setGoals([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchGoals]);

  async function signIn(email, password) {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email, password, displayName) {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
  }

  async function signOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setGoals([]);
  }

  const refreshProfile = useCallback(() => {
    if (user) return fetchProfile(user.id);
  }, [user, fetchProfile]);

  const refreshGoals = useCallback(() => {
    if (user) return fetchGoals(user.id);
  }, [user, fetchGoals]);

  return (
    <AuthContext.Provider value={{
      user, profile, goals, loading,
      signIn, signUp, signOut,
      refreshProfile, refreshGoals,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
