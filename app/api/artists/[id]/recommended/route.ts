import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ArtistsController } from '@/lib/controllers/artists';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = parseInt(params.id);

    if (isNaN(artistId)) {
      return NextResponse.json({ error: 'Invalid artist ID' }, { status: 400 });
    }

    const artists = await ArtistsController.getRecommendedArtists(artistId, 12);

    return NextResponse.json({ artists });
  } catch (error) {
    console.error('Error fetching recommended artists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended artists' },
      { status: 500 }
    );
  }
}