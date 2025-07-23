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

    if (isNaN(albumId)) {
      return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
    }

    const albums = await AlbumsController.getRecommendedAlbums(albumId, 12);

    return NextResponse.json({ albums });
  } catch (error) {
    console.error('Error fetching recommended albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended albums' },
      { status: 500 }
    );
  }
}