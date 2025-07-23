// app/api/sync/user/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { UserRoleService, UserRole } from "@/lib/services/user-role-service";

// Interface request
interface SyncUserRequest {
  email: string;                    // Required
  password: string;                 // Required
  name?: string;                    // Optional - tên người dùng
  avatar?: string;                  // Optional - URL avatar
  role?: 'admin' | 'music_provider' | 'user'; // Optional - default 'user'
}

// Interface response
interface SyncUserResponse {
  success: boolean;
  action: 'created' | 'updated';   
  user: {
    id: string;                    // UUID từ Supabase - quan trọng nhất
    email: string;
    name?: string;
    avatar?: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SyncUserResponse>> {
  try {
    // Try using admin client with service role
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Log để debug
    console.log('API called with:', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    // Check webhook secret for authentication
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return NextResponse.json({
        success: false,
        action: 'created',
        user: {} as any,
        error: "Server configuration error"
      }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({
        success: false,
        action: 'created',
        user: {} as any,
        error: "Unauthorized - Invalid webhook secret"
      }, { status: 401 });
    }
    
    // Parse request body
    const body: SyncUserRequest = await request.json();
    const { email, password, name, avatar, role = 'user' } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        action: 'created',
        user: {} as any,
        error: "Email and password are required"
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        action: 'created',
        user: {} as any,
        error: "Invalid email format"
      }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);
    
    let userId: string;
    let action: 'created' | 'updated';
    
    // Prepare user metadata
    const userMetadata = {
      name: name || '',
      avatar_url: avatar || '',
      updated_at: new Date().toISOString()
    };

    if (existingUser) {
      // User exists - update password and metadata
      console.log('Updating existing user:', email);
      
      // Method 1: Try admin update first
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          user_metadata: {
            ...existingUser.user_metadata,
            ...userMetadata
          }
        }
      );

      if (updateError) {
        console.log('Admin update failed, trying alternative method...', updateError.message);
        
        // Method 2: Alternative - just update metadata via direct client update
        // This might work if admin update is restricted
        try {
          // Update user_metadata only (password update might be restricted)
          const { data: metadataUpdate, error: metadataError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                ...existingUser.user_metadata,
                ...userMetadata
              }
            }
          );

          if (metadataError) {
            console.log('Could not update user metadata, but user exists');
            // User exists but can't update - still return success with existing data
            userId = existingUser.id;
            action = 'updated';
          } else {
            console.log('User metadata updated successfully');
            userId = existingUser.id;
            action = 'updated';
          }
        } catch (metaError) {
          // Even metadata update failed, but user exists - return existing data
          console.log('Metadata update failed, returning existing user data');
          userId = existingUser.id;
          action = 'updated';
        }
      } else {
        console.log('User updated via admin method');
        userId = existingUser.id;
        action = 'updated';
      }
      
    } else {
      // User doesn't exist - try normal signup first, then admin create
      console.log('Attempting to create new user:', email);
      
      // Method 1: Try normal signup first
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: undefined
        }
      });

      if (signUpData && signUpData.user && !signUpError) {
        console.log('User created via normal signup');
        userId = signUpData.user.id;
        action = 'created';
      } else {
        console.log('Normal signup failed, trying admin create...', signUpError?.message);
        
        // Method 2: Fallback to admin create
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: userMetadata
        });

        if (createError || !newUser.user) {
          console.error(' Detailed create user error:', {
            signUpError: signUpError?.message,
            adminError: createError?.message,
            email: email
          });
          
          return NextResponse.json({
            success: false,
            action: 'created',
            user: {} as any,
            error: `Failed to create user: ${createError?.message || signUpError?.message || 'Both methods failed'}`,
            debug: {
              signup_error: signUpError?.message,
              admin_error: createError?.message,
              methods_tried: ['signup', 'admin_create']
            }
          }, { status: 500 });
        }

        userId = newUser.user.id;
        action = 'created';
      }
    }

    // Update user role
    const roleUpdated = await UserRoleService.updateUserRole(email, role);
    if (!roleUpdated && action === 'created') {
      // If this is a new user and role creation failed, clean up
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({
        success: false,
        action: 'created',
        user: {} as any,
        error: "Failed to assign user role"
      }, { status: 500 });
    }

    // Get final user info to return
    const { data: finalUser } = await supabase.auth.admin.getUserById(userId);
    
    // Fallback to existing user data if admin.getUserById fails
    const userData = finalUser?.user || existingUser;
    
    const response: SyncUserResponse = {
      success: true,
      action,
      user: {
        id: userId,                                           
        email: email,
        name: userData?.user_metadata?.name || name || '',
        avatar: userData?.user_metadata?.avatar_url || avatar || '',
        role: role,
        created_at: userData?.created_at || new Date().toISOString(),
        updated_at: userData?.updated_at || new Date().toISOString()
      }
    };

    console.log(`✅ User sync ${action}: ${email} -> UUID: ${userId}`);
    return NextResponse.json(response, { status: action === 'created' ? 201 : 200 });

  } catch (error) {
    console.error('❌ Error syncing user:', error);
    return NextResponse.json({
      success: false,
      action: 'created',
      user: {} as any,
      error: "Internal server error"
    }, { status: 500 });
  }
}

// GET endpoint để check user theo email
export async function GET(request: NextRequest) {
  try {
    // Check webhook secret for authentication
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return NextResponse.json({
        error: "Server configuration error"
      }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({
        error: "Unauthorized - Invalid webhook secret"
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({
        error: "Email parameter is required"
      }, { status: 400 });
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get user from auth
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json({
        exists: false,
        message: "User not found"
      }, { status: 404 });
    }

    // Get user role
    const userRole = await UserRoleService.getUserRoleByEmail(email);
    
    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,                                      // ⭐ UUID
        email: user.email,
        name: user.user_metadata?.name,
        avatar: user.user_metadata?.avatar_url,
        role: userRole,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Error getting user:', error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}