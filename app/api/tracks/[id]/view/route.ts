
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    if (isNaN(trackId)) {
      return NextResponse.json(
        { error: "Invalid track ID" },
        { status: 400 }
      );
    }

    const { viewDuration, sessionId } = await request.json();

    // Minimum view duration to count (30 seconds)
    const minViewDuration = 30;
    if (!viewDuration || viewDuration < minViewDuration) {
      return NextResponse.json(
        { error: "Insufficient play duration" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Get client IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "0.0.0.0";

    // Generate session ID if not provided
    const finalSessionId = sessionId || `${Date.now()}-${Math.random().toString(36)}`;

    // Record the view
    const { data, error } = await supabase
      .from("track_views")
      .insert({
        track_id: trackId,
        user_id: user?.id || null,
        ip_address: ip,
        user_agent: request.headers.get("user-agent") || null,
        view_duration: viewDuration,
        session_id: finalSessionId,
      })
      .select()
      .single();

    if (error) {
      // If unique constraint violation, view already recorded
      if (error.code === '23505') {
        return NextResponse.json(
          { message: "View already recorded for this session" },
          { status: 200 }
        );
      }
      console.error("Error recording view:", error);
      return NextResponse.json(
        { error: "Failed to record view" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "View recorded successfully",
      viewId: data.id
    });

  } catch (error) {
    console.error("Error in view recording:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    if (isNaN(trackId)) {
      return NextResponse.json(
        { error: "Invalid track ID" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get view count
    const { data, error } = await supabase
      .from("tracks")
      .select("view_count")
      .eq("id", trackId)
      .single();

    if (error) {
      console.error("Error getting view count:", error);
      return NextResponse.json(
        { error: "Failed to get view count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      trackId,
      viewCount: data?.view_count || 0
    });

  } catch (error) {
    console.error("Error getting view count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
