import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateNumeroPedido(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { club_id, items, cliente, direccion_envio, notas } = body;

    if (!club_id || !items || items.length === 0 || !cliente || !direccion_envio) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('comision_porcentaje')
      .eq('id', club_id)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      );
    }

    let subtotal = 0;
    const itemsConPrecios = [];

    for (const item of items) {
      const { data: producto } = await supabase
        .from('productos')
        .select('precio_base, costo_produccion')
        .eq('id', item.producto_id)
        .single();

      if (!producto) {
        return NextResponse.json(
          { error: `Producto ${item.producto_id} no encontrado` },
          { status: 404 }
        );
      }

      const itemSubtotal = producto.precio_base * item.cantidad;
      subtotal += itemSubtotal;

      itemsConPrecios.push({
        ...item,
        precio_unitario: producto.precio_base,
        subtotal: itemSubtotal
      });
    }

    const costo_envio = 500;
    const total = subtotal + costo_envio;
    const comision_plataforma = total * (club.comision_porcentaje / 100);
    const pago_club = total - comision_plataforma;

    const numeroPedido = generateNumeroPedido();

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        club_id,
        numero_pedido: numeroPedido,
        estado: 'pendiente_pago',
        cliente_email: cliente.email,
        cliente_nombre: cliente.nombre,
        direccion_envio: {
          ...direccion_envio,
          telefono: cliente.telefono
        },
        subtotal,
        costo_envio,
        total,
        comision_plataforma,
        pago_club,
        notas
      })
      .select()
      .single();

    if (pedidoError || !pedido) {
      throw pedidoError;
    }

    const itemsInsert = itemsConPrecios.map(item => ({
      pedido_id: pedido.id,
      producto_id: item.producto_id,
      variante_id: item.variante_id || null,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase
      .from('items_pedido')
      .insert(itemsInsert);

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json({
      pedido_id: pedido.id,
      numero_pedido: pedido.numero_pedido,
      total: pedido.total
    });
  } catch (error) {
    console.error('Error creating pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
