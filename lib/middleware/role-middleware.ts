
import { NextRequest, NextResponse } from "next/server";
import { UserRoleService, UserRole } from "@/lib/services/user-role-service";

export interface RoutePermission {
  path: string;
  requiredRole: UserRole;
}

// Define route permissions
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: '/dashboard', requiredRole: 'music_provider' },
  { path: '/admin', requiredRole: 'admin' },
  { path: '/right-management', requiredRole: 'admin' },
];

export async function checkRoutePermission(
  pathname: string, 
  userEmail: string
): Promise<{ allowed: boolean; userRole: UserRole; redirectTo?: string }> {
  // Get user role
  const userRole = await UserRoleService.getUserRoleByEmail(userEmail);
  
  // Check and update role if user has completed agreements
  if (userRole === 'user') {
    await UserRoleService.checkAndUpdateMusicProviderRole(userEmail);
    // Re-get role after potential update
    const updatedRole = await UserRoleService.getUserRoleByEmail(userEmail);
    
    // Check if user now has permission
    const requiredPermission = ROUTE_PERMISSIONS.find(perm => 
      pathname.startsWith(perm.path)
    );

    if (requiredPermission) {
      const hasPermission = UserRoleService.hasPermission(updatedRole, requiredPermission.requiredRole);
      
      if (!hasPermission) {
        return {
          allowed: false,
          userRole: updatedRole,
          redirectTo: updatedRole === 'user' ? '/music' : '/dashboard'
        };
      }
    }

    return { allowed: true, userRole: updatedRole };
  }

  // Check permissions for existing roles
  const requiredPermission = ROUTE_PERMISSIONS.find(perm => 
    pathname.startsWith(perm.path)
  );

  if (requiredPermission) {
    const hasPermission = UserRoleService.hasPermission(userRole, requiredPermission.requiredRole);
    
    if (!hasPermission) {
      return {
        allowed: false,
        userRole,
        redirectTo: userRole === 'user' ? '/music' : '/dashboard'
      };
    }
  }

  return { allowed: true, userRole };
}
