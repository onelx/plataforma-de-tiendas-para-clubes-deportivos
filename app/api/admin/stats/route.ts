import { NextResponse } from 'next/server';
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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [clubsRes, pedidosRes, clubsMesRes] = await Promise.all([
      supabase
        .from('clubs')
        .select('id', { count: 'exact' })
        .eq('activo', true),
      supabase
        .from('pedidos')
        .select('total'),
      supabase
        .from('clubs')
        .select('id', { count: 'exact' })
        .gte('created_at', startOfMonth),
    ]);

    const totalClubs = clubsRes.count ?? 0;
    const pedidos = pedidosRes.data || [];
    const totalPedidos = pedidos.length;
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
    const clubsEsteMes = clubsMesRes.count ?? 0;

    return NextResponse.json({
      total_clubs: totalClubs,
      total_pedidos: totalPedidos,
      ventas_totales: ventasTotales,
      clubs_este_mes: clubsEsteMes,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
