"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserRole } from "@/lib/services/user-role-service";

export type User = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
};

interface UserContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Global cache for user role
let globalRoleCache: { role: UserRole; timestamp: number; email: string } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const initialized = useRef(false);
  const fetchingRole = useRef(false);

  // Fetch user role function
  const fetchUserRole = async (userEmail: string) => {
    if (fetchingRole.current) return;
    
    try {
      fetchingRole.current = true;

      // Check global cache first
      if (globalRoleCache && 
          globalRoleCache.email === userEmail &&
          Date.now() - globalRoleCache.timestamp < CACHE_DURATION) {
        setUserRole(globalRoleCache.role);
        return;
      }

      const response = await fetch('/api/user/role');
      if (!response.ok) {
        throw new Error('Failed to fetch user role');
      }

      const data = await response.json();
      const role = data.role || 'user';
      
      // Update global cache
      globalRoleCache = { role, timestamp: Date.now(), email: userEmail };
      setUserRole(role);
    } catch (err) {
      console.error('Error fetching user role:', err);
      setUserRole('user'); // Default fallback
    } finally {
      fetchingRole.current = false;
    }
  };

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
          setUserRole('user');
        } else {
          const currentUser = session?.user as User || null;
          setUser(currentUser);
          
          // Fetch role if user exists
          if (currentUser?.email) {
            await fetchUserRole(currentUser.email);
          } else {
            setUserRole('user');
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err as Error);
        setUser(null);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      // Only update state for important events, not token refresh
      if (event === 'SIGNED_IN') {
        const currentUser = session?.user as User || null;
        setUser(currentUser);
        setLoading(false);
        setError(null);
        
        // Clear cache and fetch new role
        globalRoleCache = null;
        if (currentUser?.email) {
          await fetchUserRole(currentUser.email);
        } else {
          setUserRole('user');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole('user');
        setLoading(false);
        setError(null);
        // Clear cache on logout
        globalRoleCache = null;
      } else if (event === 'INITIAL_SESSION') {
        const currentUser = session?.user as User || null;
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser?.email) {
          await fetchUserRole(currentUser.email);
        } else {
          setUserRole('user');
        }
      }
      // Ignore TOKEN_REFRESHED events to prevent unnecessary updates
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, userRole, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Legacy hooks for backward compatibility
export function useCurrentUser() {
  const { user, loading, error } = useUser();
  return { user, loading, error };
}

export function useUserRole() {
  const { userRole, loading, error } = useUser();
  return { userRole, loading, error: error?.message || null };
} 