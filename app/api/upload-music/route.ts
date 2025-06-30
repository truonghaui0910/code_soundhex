
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

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

    // 1. Handle Genre
    let genreRecord = null;
    const { data: existingGenre } = await supabase
      .from("genres")
      .select("*")
      .eq("name", genre)
      .single();

    if (existingGenre) {
      genreRecord = existingGenre;
    } else {
      const { data: newGenre, error: genreError } = await supabase
        .from("genres")
        .insert({ name: genre })
        .select()
        .single();

      if (genreError) {
        console.error("Error creating genre:", genreError);
        return NextResponse.json(
          { error: "Failed to create genre" },
          { status: 500 }
        );
      }
      genreRecord = newGenre;
    }

    // 2. Handle Artist
    let artistRecord = null;
    if (isNewArtist) {
      // Upload artist image if provided
      let artistImageUrl = null;
      if (artistImage) {
        const artistImagePath = `artists/${session.user.id}/${Date.now()}_${artistImage.name}`;
        const { data: artistImageUpload, error: artistImageError } = await supabase.storage
          .from('music-files')
          .upload(artistImagePath, artistImage);

        if (artistImageError) {
          console.error("Error uploading artist image:", artistImageError);
          return NextResponse.json(
            { error: "Failed to upload artist image" },
            { status: 500 }
          );
        }

        const { data: artistImagePublic } = supabase.storage
          .from('music-files')
          .getPublicUrl(artistImagePath);
        
        artistImageUrl = artistImagePublic.publicUrl;
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
        const albumImagePath = `albums/${session.user.id}/${Date.now()}_${albumImage.name}`;
        const { data: albumImageUpload, error: albumImageError } = await supabase.storage
          .from('music-files')
          .upload(albumImagePath, albumImage);

        if (albumImageError) {
          console.error("Error uploading album image:", albumImageError);
          return NextResponse.json(
            { error: "Failed to upload album image" },
            { status: 500 }
          );
        }

        const { data: albumImagePublic } = supabase.storage
          .from('music-files')
          .getPublicUrl(albumImagePath);
        
        albumImageUrl = albumImagePublic.publicUrl;
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
    const audioFilePath = `tracks/${session.user.id}/${Date.now()}_${audioFile.name}`;
    const { data: audioUpload, error: audioError } = await supabase.storage
      .from('music-files')
      .upload(audioFilePath, audioFile);

    if (audioError) {
      console.error("Error uploading audio file:", audioError);
      return NextResponse.json(
        { error: "Failed to upload audio file" },
        { status: 500 }
      );
    }

    const { data: audioPublic } = supabase.storage
      .from('music-files')
      .getPublicUrl(audioFilePath);

    // 5. Create track record
    const { data: newTrack, error: trackError } = await supabase
      .from("tracks")
      .insert({
        title: title,
        description: description || null,
        duration: 0, // You might want to calculate this from the audio file
        file_url: audioPublic.publicUrl,
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
