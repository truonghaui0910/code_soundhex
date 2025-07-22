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

    const { albumIds } = await request.json();
    
    if (!Array.isArray(albumIds) || albumIds.length === 0) {
      return NextResponse.json({ error: 'Invalid album IDs' }, { status: 400 });
    }

    // Limit batch size to prevent too large requests
    if (albumIds.length > 100) {
      return NextResponse.json({ error: 'Too many album IDs (max 100)' }, { status: 400 });
    }

    // Get user's likes for all albums in one query
    const { data: userLikes, error: likesError } = await supabase
      .from('user_album_likes')
      .select('album_id')
      .eq('user_id', user.id)
      .in('album_id', albumIds);

    if (likesError) {
      console.error('Error fetching user album likes:', likesError);
      return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
    }

    // Get total likes count for all albums in one query
    const { data: totalLikes, error: totalLikesError } = await supabase
      .from('user_album_likes')
      .select('album_id')
      .in('album_id', albumIds);

    if (totalLikesError) {
      console.error('Error fetching total album likes:', totalLikesError);
      return NextResponse.json({ error: 'Failed to fetch total likes' }, { status: 500 });
    }

    // Count likes per album
    const likesCount = totalLikes.reduce((acc, like) => {
      acc[like.album_id] = (acc[like.album_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Create set of liked album IDs for current user
    const likedAlbumIds = new Set(userLikes.map(like => like.album_id));

    // Build response object with like status for each album
    const response = albumIds.reduce((acc, albumId) => {
      acc[albumId] = {
        isLiked: likedAlbumIds.has(albumId),
        totalLikes: likesCount[albumId] || 0,
        isLoading: false,
      };
      return acc;
    }, {} as Record<number, { isLiked: boolean; totalLikes: number; isLoading: boolean }>);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in batch album likes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 