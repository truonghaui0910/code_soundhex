
import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customUrl = searchParams.get("custom_url");
        const excludeId = searchParams.get("exclude_id");

        if (!customUrl) {
            return NextResponse.json({ available: false, error: "URL is required" });
        }

        const supabase = createServerComponentClient({ cookies });

        let query = supabase
            .from("tracks")
            .select("id")
            .eq("custom_url", customUrl);

        if (excludeId) {
            query = query.neq("id", parseInt(excludeId));
        }

        const { data } = await query.single();

        return NextResponse.json({ available: !data });
    } catch (error) {
        console.error("Error checking track URL:", error);
        return NextResponse.json({ available: true });
    }
}
