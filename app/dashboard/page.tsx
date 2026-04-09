'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, ShoppingBag, Package, Clock, Plus } from 'lucide-react';
import type { Pedido, EstadoPedido } from '@/types';

const estadoColors: Record<EstadoPedido, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagado: 'bg-blue-100 text-blue-800',
  produccion: 'bg-purple-100 text-purple-800',
  enviado: 'bg-orange-100 text-orange-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

interface Stats {
  totalVentas: number;
  totalPedidos: number;
  productosActivos: number;
  pedidosPendientes: number;
}

export default function DashboardPage() {
  const { user, usuarioClub, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [stats, setStats] = useState<Stats>({
    totalVentas: 0,
    totalPedidos: 0,
    productosActivos: 0,
    pedidosPendientes: 0,
  });
  const [ultimosPedidos, setUltimosPedidos] = useState<Pedido[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!usuarioClub?.club_id) return;

    const fetchData = async () => {
      setLoadingData(true);
      const clubId = usuarioClub.club_id;

      try {
        const [pedidosRes, productosRes] = await Promise.all([
          supabase
            .from('pedidos')
            .select('id, numero_pedido, cliente_nombre, total, estado, created_at')
            .eq('club_id', clubId)
            .order('created_at', { ascending: false }),
          supabase
            .from('productos')
            .select('id')
            .eq('club_id', clubId)
            .eq('activo', true),
        ]);

        const pedidos = pedidosRes.data || [];
        const productos = productosRes.data || [];

        const totalVentas = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
        const pedidosPendientes = pedidos.filter((p) => p.estado === 'pendiente').length;

        setStats({
          totalVentas,
          totalPedidos: pedidos.length,
          productosActivos: productos.length,
          pedidosPendientes,
        });

        setUltimosPedidos(pedidos.slice(0, 5) as Pedido[]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [usuarioClub, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  const statCards = [
    {
      title: 'Ventas Totales',
      value: `$${stats.totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pedidos Totales',
      value: stats.totalPedidos.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Productos Activos',
      value: stats.productosActivos.toString(),
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Pedidos Pendientes',
      value: stats.pedidosPendientes.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen de tu tienda</p>
        </div>
        <Link href="/dashboard/productos">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    {loadingData ? (
                      <div className="h-8 w-20 bg-gray-100 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last 5 orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimos Pedidos</CardTitle>
          <Link href="/dashboard/pedidos">
            <Button variant="outline" size="sm">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : ultimosPedidos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay pedidos aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">N° Pedido</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Cliente</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Total</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosPedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{pedido.numero_pedido}</td>
                      <td className="py-3 px-2 text-gray-600">{pedido.cliente_nombre}</td>
                      <td className="py-3 px-2 text-right font-medium">
                        ${pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColors[pedido.estado]}`}
                        >
                          {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
