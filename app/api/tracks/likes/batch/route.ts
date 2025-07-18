
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trackIds } = await request.json();
    
    if (!Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json({ error: 'Invalid track IDs' }, { status: 400 });
    }

    // Limit batch size to prevent too large requests
    if (trackIds.length > 100) {
      return NextResponse.json({ error: 'Too many track IDs (max 100)' }, { status: 400 });
    }

    // Get user's likes for all tracks in one query
    const { data: userLikes, error: likesError } = await supabase
      .from('user_track_likes')
      .select('track_id')
      .eq('user_id', user.id)
      .in('track_id', trackIds);

    if (likesError) {
      console.error('Error fetching user likes:', likesError);
      return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
    }

    // Get total likes count for all tracks in one query
    const { data: totalLikes, error: totalLikesError } = await supabase
      .from('user_track_likes')
      .select('track_id')
      .in('track_id', trackIds);

    if (totalLikesError) {
      console.error('Error fetching total likes:', totalLikesError);
      return NextResponse.json({ error: 'Failed to fetch total likes' }, { status: 500 });
    }

    // Count likes per track
    const likesCount = totalLikes.reduce((acc, like) => {
      acc[like.track_id] = (acc[like.track_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Create user likes set for fast lookup
    const userLikedSet = new Set(userLikes.map(like => like.track_id));

    // Build response object
    const result = trackIds.reduce((acc, trackId) => {
      acc[trackId] = {
        isLiked: userLikedSet.has(trackId),
        totalLikes: likesCount[trackId] || 0,
        isLoading: false
      };
      return acc;
    }, {} as Record<number, { isLiked: boolean; totalLikes: number; isLoading: boolean }>);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Batch likes API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
