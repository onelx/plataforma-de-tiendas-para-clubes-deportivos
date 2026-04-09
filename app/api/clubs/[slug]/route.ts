import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = getSupabase();
  try {
    const { data: club, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('slug', params.slug)
      .eq('activo', true)
      .single();

    if (error || !club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      );
    }

    const publicClubData = {
      id: club.id,
      slug: club.slug,
      nombre: club.nombre,
      logo_url: club.logo_url,
      color_primario: club.color_primario,
      color_secundario: club.color_secundario,
      activo: club.activo
    };

    return NextResponse.json(publicClubData);
  } catch (error) {
    console.error('Error fetching club:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
