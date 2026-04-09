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
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id')
      .eq('slug', params.slug)
      .eq('activo', true)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      );
    }

    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select(`
        *,
        variantes:variantes_producto(*)
      `)
      .eq('club_id', club.id)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (productosError) {
      throw productosError;
    }

    return NextResponse.json(productos || []);
  } catch (error) {
    console.error('Error fetching productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
