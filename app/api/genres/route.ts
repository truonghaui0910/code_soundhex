
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("genres")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching genres:", error);
      return NextResponse.json(
        { error: "Failed to fetch genres" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Genres API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
