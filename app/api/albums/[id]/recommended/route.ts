import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AlbumsController } from '@/lib/controllers/albums';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = parseInt(params.id);
    console.log('🎵 API: Fetching recommended albums for album ID:', albumId);

    if (isNaN(albumId)) {
      console.error('❌ Invalid album ID provided:', params.id);
      return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
    }

    const albums = await AlbumsController.getRecommendedAlbums(albumId, 12);
    console.log('🎵 API: Recommended albums fetched, count:', albums?.length || 0);

    return NextResponse.json({ albums });
  } catch (error) {
    console.error('❌ Error fetching recommended albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended albums' },
      { status: 500 }
    );
  }
}