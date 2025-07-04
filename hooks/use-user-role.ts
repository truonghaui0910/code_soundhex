
"use client";

import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/services/user-role-service';
import { supabase } from '@/lib/supabase/client';

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.email) {
          setUserRole('user');
          return;
        }

        // Call our API to get user role
        const response = await fetch('/api/user/role');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user role');
        }

        const data = await response.json();
        setUserRole(data.role || 'user');
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          fetchUserRole();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { userRole, loading, error };
}
