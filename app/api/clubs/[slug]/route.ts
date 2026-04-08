import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/clubs/[slug] - Datos públicos del club
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: club, error } = await supabase
      .from("clubs")
      .select("id, slug, nombre, logo_url, color_primario, color_secundario")
      .eq("slug", params.slug)
      .eq("activo", true)
      .single();

    if (error || !club) {
      return NextResponse.json(
        { error: "Club no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error("Error fetching club:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
