import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Assume we check a specific role for access
async function checkRightManagementAccess(userId: string) {
  // Mock access check logic
  // Return false to simulate no access
  return false;
}

export default async function RightManagementPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.auth.getSession();
  
  if (!data.session) {
    redirect("/login");
  }
  
  const user = data.session.user;
  
  // Check access permission
  const hasAccess = await checkRightManagementAccess(user.id);
  
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the rights management page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please contact an administrator to request access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold">Rights Management</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
          <CardDescription>
            Manage user access permissions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Rights management content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}