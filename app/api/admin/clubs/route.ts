import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('*, pedidos(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { nombre, slug, color_primario, color_secundario, comision_porcentaje } = body;

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'nombre y slug son requeridos' }, { status: 400 });
    }

    // Validate slug
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'El slug solo puede contener letras minúsculas, números y guiones' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('clubs')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'El slug ya está en uso' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('clubs')
      .insert({
        nombre,
        slug,
        color_primario: color_primario || '#1d4ed8',
        color_secundario: color_secundario || '#ffffff',
        comision_porcentaje: comision_porcentaje ?? 15,
        activo: true,
        logo_url: null,
        stripe_account_id: null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
