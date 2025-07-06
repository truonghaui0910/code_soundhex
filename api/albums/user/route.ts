
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/services/user-role-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const userRole = await getUserRole(user.email!);
    if (!userRole) {
      return NextResponse.json({ error: 'User role not found' }, { status: 403 });
    }

    // Get user's albums
    const { data: albums, error } = await supabase
      .from('albums')
      .select(`
        *,
        artist:artists(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user albums:', error);
      return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
    }

    return NextResponse.json(albums || []);
  } catch (error) {
    console.error('Error in user albums API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
