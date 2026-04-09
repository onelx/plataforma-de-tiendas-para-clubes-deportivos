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
  const { id } = params;

  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*, variantes:variantes_producto(*)')
      .eq('club_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching productos for club:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const { id } = params;

  try {
    const body = await request.json();
    const { nombre, descripcion, precio_base, costo_produccion, categoria, imagenes, variantes } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'nombre es requerido' }, { status: 400 });
    }

    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .insert({
        club_id: id,
        nombre,
        descripcion: descripcion || null,
        precio_base: precio_base || 0,
        costo_produccion: costo_produccion || 0,
        categoria: categoria || null,
        imagenes: imagenes || [],
        activo: true,
      })
      .select()
      .single();

    if (productoError) throw productoError;

    if (variantes && Array.isArray(variantes) && variantes.length > 0) {
      const variantesData = variantes.map((v: { talla?: string; color?: string; sku?: string }) => ({
        producto_id: producto.id,
        talla: v.talla || null,
        color: v.color || null,
        sku: v.sku || null,
        activo: true,
      }));

      const { error: variantesError } = await supabase
        .from('variantes_producto')
        .insert(variantesData);

      if (variantesError) throw variantesError;
    }

    const { data: productoCompleto } = await supabase
      .from('productos')
      .select('*, variantes:variantes_producto(*)')
      .eq('id', producto.id)
      .single();

    return NextResponse.json(productoCompleto, { status: 201 });
  } catch (error) {
    console.error('Error creating producto for club:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
