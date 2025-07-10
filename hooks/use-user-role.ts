
"use client";

import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/services/user-role-service';
import { supabase } from '@/lib/supabase/client';

// Cache for user role to prevent duplicate API calls
let roleCache: { role: UserRole; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let isCurrentlyFetching = false;

    async function fetchUserRole() {
      // Prevent duplicate calls
      if (isCurrentlyFetching) return;
      
      try {
        isCurrentlyFetching = true;
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (!session?.user?.email) {
          setUserRole('user');
          return;
        }

        // Check cache first
        if (roleCache && Date.now() - roleCache.timestamp < CACHE_DURATION) {
          setUserRole(roleCache.role);
          return;
        }

        // Call our API to get user role
        const response = await fetch('/api/user/role');
        
        if (!mounted) return;
        
        if (!response.ok) {
          throw new Error('Failed to fetch user role');
        }

        const data = await response.json();
        const role = data.role || 'user';
        
        // Update cache
        roleCache = { role, timestamp: Date.now() };
        setUserRole(role);
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUserRole('user');
      } finally {
        if (mounted) {
          setLoading(false);
          isCurrentlyFetching = false;
        }
      }
    }

    fetchUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          // Clear cache on auth changes
          roleCache = null;
          fetchUserRole();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { userRole, loading, error };
}
