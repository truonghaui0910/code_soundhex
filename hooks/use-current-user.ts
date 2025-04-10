"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          throw authError;
        }

        if (session?.user) {
          setUser(session.user as User);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user as User || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading, error };
}