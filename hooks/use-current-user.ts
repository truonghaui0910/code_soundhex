"use client";

import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type User = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
};

export function useCurrentUser() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get initial session only once
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError) {
          console.error("Auth error:", authError);
          setError(authError);
          setUser(null);
        } else {
          setUser(session?.user as User || null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err as Error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      // Only update state for important events, not token refresh
      if (event === 'SIGNED_IN') {
        setUser(session?.user as User || null);
        setLoading(false);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        setError(null);
      } else if (event === 'INITIAL_SESSION') {
        setUser(session?.user as User || null);
        setLoading(false);
      }
      // Ignore TOKEN_REFRESHED events to prevent unnecessary updates
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading, error };
}