import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching club:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { nombre, color_primario, color_secundario, activo, comision_porcentaje, logo_url } = body;

    const updateData: Record<string, unknown> = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (color_primario !== undefined) updateData.color_primario = color_primario;
    if (color_secundario !== undefined) updateData.color_secundario = color_secundario;
    if (activo !== undefined) updateData.activo = activo;
    if (comision_porcentaje !== undefined) updateData.comision_porcentaje = comision_porcentaje;
    if (logo_url !== undefined) updateData.logo_url = logo_url;

    const { data, error } = await supabase
      .from('clubs')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
