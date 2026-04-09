import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { EstadoPedido } from '@/types';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { estado } = body as { estado: EstadoPedido };

    if (!estado) {
      return NextResponse.json({ error: 'estado es requerido' }, { status: 400 });
    }

    const validEstados: EstadoPedido[] = ['pendiente', 'pagado', 'produccion', 'enviado', 'entregado', 'cancelado'];
    if (!validEstados.includes(estado)) {
      return NextResponse.json({ error: 'estado inválido' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { estado };

    if (estado === 'pagado') {
      updateData.paid_at = new Date().toISOString();
    }

    if (estado === 'enviado') {
      updateData.shipped_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating pedido:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
