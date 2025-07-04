
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type UserRole = 'admin' | 'music_provider' | 'user';

export interface UserRoleData {
  id: number;
  user_id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export class UserRoleService {
  // Get user role by email (for API routes)
  static async getUserRoleByEmail(email: string): Promise<UserRole> {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`No role record found for email: ${email}, using default 'user' role`);
        } else {
          console.error('Error getting user role:', error);
        }
        return 'user'; // Default role
      }

      if (!data) {
        console.log(`No role data found for email: ${email}, using default 'user' role`);
        return 'user';
      }

      console.log(`Found role '${data.role}' for email: ${email}`);
      return data.role as UserRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'user'; // Default role on error
    }
  }

  // Get user role for server components
  static async getCurrentUserRole(): Promise<UserRole> {
    try {
      const supabase = createServerSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        return 'user';
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', session.user.email)
        .single();

      if (error || !data) {
        return 'user';
      }

      return data.role as UserRole;
    } catch (error) {
      console.error('Error getting current user role:', error);
      return 'user';
    }
  }

  // Update user role
  static async updateUserRole(email: string, newRole: UserRole): Promise<boolean> {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      
      // First check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking user existence:', checkError);
        return false;
      }

      if (existingUser) {
        // User exists, update role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('email', email);

        if (error) {
          console.error('Error updating user role:', error);
          return false;
        }
      } else {
        // User doesn't exist, insert new record
        const { error } = await supabase
          .from('user_roles')
          .insert({
            email: email,
            role: newRole,
            user_id: email, // Use email as user_id temporarily
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating user role:', error);
          return false;
        }
      }

      console.log(`Successfully updated/created role ${newRole} for ${email}`);
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  // Check if user has completed agreements (will be called when admin signs agreement)
  static async checkAndUpdateMusicProviderRole(email: string): Promise<void> {
    try {
      // Call external API to check if user has completed agreements
      const apiBaseUrl = process.env.FORM_SUBMISSION_API_BASE_URL || 'https://docs.360digital.fm/api';
      const response = await fetch(
        `${apiBaseUrl}/submissions?q=${encodeURIComponent(email)}&limit=100`,
        {
          headers: {
            'X-Auth-Token': process.env.FORM_SUBMISSION_API_TOKEN!
          }
        }
      );

      if (!response.ok) {
        console.error('Failed to check agreements for role update');
        return;
      }

      const data = await response.json();
      const agreements = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      
      // Check if user has any completed agreements
      const hasCompletedAgreement = agreements.some((agreement: any) => 
        agreement.status?.toLowerCase() === 'completed' &&
        agreement.submitters?.some((submitter: any) => 
          submitter.email === email && submitter.status?.toLowerCase() === 'completed'
        )
      );

      if (hasCompletedAgreement) {
        const currentRole = await this.getUserRoleByEmail(email);
        if (currentRole === 'user') {
          await this.updateUserRole(email, 'music_provider');
          console.log(`Updated role to music_provider for ${email}`);
        }
      }
    } catch (error) {
      console.error('Error checking agreements for role update:', error);
    }
  }

  // Get all users with roles (admin only)
  static async getAllUsersWithRoles(): Promise<UserRoleData[]> {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all users with roles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all users with roles:', error);
      return [];
    }
  }

  // Check if user has permission for specific action
  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      'user': 1,
      'music_provider': 2,
      'admin': 3
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}
