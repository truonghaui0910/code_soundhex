
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { AWSHelper } from "@/lib/services/aws-helper";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      console.error("🔒 AUTH_ERROR:", authError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract form data
    const audioFile = formData.get('audioFile') as File;
    const title = formData.get('title') as string;
    const genre = formData.get('genre') as string;
    const album = formData.get('album') as string;
    const artist = formData.get('artist') as string;
    const description = formData.get('description') as string;
    const isNewAlbum = formData.get('isNewAlbum') === 'true';
    const isNewArtist = formData.get('isNewArtist') === 'true';
    const albumImage = formData.get('albumImage') as File | null;
    const artistImage = formData.get('artistImage') as File | null;

    console.log("🎵 UPLOAD_MUSIC_START:", {
      userEmail: session.user.email,
      title,
      genre,
      album,
      artist,
      isNewAlbum,
      isNewArtist
    });

    // Validate required fields
    if (!audioFile || !title || !genre || !album || !artist) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Handle Genre - only find existing genre
    const { data: genreRecord, error: genreError } = await supabase
      .from("genres")
      .select("*")
      .eq("name", genre)
      .single();

    if (genreError || !genreRecord) {
      console.error("Error finding genre:", genreError);
      return NextResponse.json(
        { error: "Genre not found" },
        { status: 400 }
      );
    }

    // 2. Handle Artist
    let artistRecord = null;
    if (isNewArtist) {
      // Upload artist image if provided
      let artistImageUrl = null;
      if (artistImage) {
        try {
          const timestamp = Date.now();
          const artistImageFilename = `${timestamp}_${artistImage.name}`;
          const artistImageBuffer = Buffer.from(await artistImage.arrayBuffer());
          
          artistImageUrl = await AWSHelper.uploadFile(
            artistImageBuffer,
            artistImageFilename,
            'artists'
          );
        } catch (error) {
          console.error("Error uploading artist image:", error);
          return NextResponse.json(
            { error: "Failed to upload artist image" },
            { status: 500 }
          );
        }
      }

      // Create new artist
      const { data: newArtist, error: artistError } = await supabase
        .from("artists")
        .insert({
          name: artist,
          profile_image_url: artistImageUrl,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (artistError) {
        console.error("Error creating artist:", artistError);
        return NextResponse.json(
          { error: "Failed to create artist" },
          { status: 500 }
        );
      }
      artistRecord = newArtist;
    } else {
      // Find existing artist
      const { data: existingArtist } = await supabase
        .from("artists")
        .select("*")
        .eq("name", artist)
        .eq("user_id", session.user.id)
        .single();

      if (!existingArtist) {
        return NextResponse.json(
          { error: "Artist not found" },
          { status: 404 }
        );
      }
      artistRecord = existingArtist;
    }

    // 3. Handle Album
    let albumRecord = null;
    if (isNewAlbum) {
      // Upload album image if provided
      let albumImageUrl = null;
      if (albumImage) {
        try {
          const timestamp = Date.now();
          const albumImageFilename = `${timestamp}_${albumImage.name}`;
          const albumImageBuffer = Buffer.from(await albumImage.arrayBuffer());
          
          albumImageUrl = await AWSHelper.uploadFile(
            albumImageBuffer,
            albumImageFilename,
            'albums'
          );
        } catch (error) {
          console.error("Error uploading album image:", error);
          return NextResponse.json(
            { error: "Failed to upload album image" },
            { status: 500 }
          );
        }
      }

      // Create new album
      const { data: newAlbum, error: albumError } = await supabase
        .from("albums")
        .insert({
          title: album,
          cover_image_url: albumImageUrl,
          artist_id: artistRecord.id,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (albumError) {
        console.error("Error creating album:", albumError);
        return NextResponse.json(
          { error: "Failed to create album" },
          { status: 500 }
        );
      }
      albumRecord = newAlbum;
    } else {
      // Find existing album
      const { data: existingAlbum } = await supabase
        .from("albums")
        .select("*")
        .eq("title", album)
        .eq("user_id", session.user.id)
        .single();

      if (!existingAlbum) {
        return NextResponse.json(
          { error: "Album not found" },
          { status: 404 }
        );
      }
      albumRecord = existingAlbum;
    }

    // 4. Upload audio file
    let audioFileUrl: string;
    try {
      const timestamp = Date.now();
      const audioFilename = `${timestamp}_${audioFile.name}`;
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      
      audioFileUrl = await AWSHelper.uploadFile(
        audioBuffer,
        audioFilename,
        'tracks'
      );
    } catch (error) {
      console.error("Error uploading audio file:", error);
      return NextResponse.json(
        { error: "Failed to upload audio file" },
        { status: 500 }
      );
    }

    // 5. Create track record
    const { data: newTrack, error: trackError } = await supabase
      .from("tracks")
      .insert({
        title: title,
        description: description || null,
        duration: 0, // You might want to calculate this from the audio file
        file_url: audioFileUrl,
        artist_id: artistRecord.id,
        album_id: albumRecord.id,
        genre_id: genreRecord.id,
        user_id: session.user.id,
        source_type: "upload",
      })
      .select()
      .single();

    if (trackError) {
      console.error("Error creating track:", trackError);
      return NextResponse.json(
        { error: "Failed to create track" },
        { status: 500 }
      );
    }

    console.log("✅ TRACK_UPLOADED_SUCCESS:", {
      trackId: newTrack.id,
      title: newTrack.title
    });

    return NextResponse.json({
      message: "Track uploaded successfully",
      track: newTrack,
    });

  } catch (error) {
    console.error("💥 UPLOAD_MUSIC_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to upload music" },
      { status: 500 }
    );
  }
}
