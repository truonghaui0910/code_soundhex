
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
  // Get user role from database (no automatic update)
  const userRole = await UserRoleService.getUserRoleByEmail(userEmail);
  
  // Check permissions for the route
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
