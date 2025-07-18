
import { NextRequest, NextResponse } from 'next/server';
import { DownloadLogger } from '@/lib/services/download-logger';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    
    if (isNaN(trackId)) {
      return NextResponse.json(
        { error: 'Invalid track ID' },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    // Get request info - handle multiple IPs in x-forwarded-for
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    // Extract first IP from x-forwarded-for if it contains multiple IPs
    let ipAddress = 'unknown';
    if (forwardedFor) {
      ipAddress = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      ipAddress = realIp;
    }
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse request body for additional info
    const body = await request.json().catch(() => ({}));
    const { downloadType, fileSizeBytes, success, errorMessage } = body;

    // Log the download
    const logged = await DownloadLogger.logDownload({
      trackId,
      userId: user?.id,
      ipAddress,
      userAgent,
      downloadType: downloadType || 'single',
      fileSizeBytes,
      success: success !== false, // default to true
      errorMessage
    });

    if (!logged) {
      return NextResponse.json(
        { error: 'Failed to log download' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
