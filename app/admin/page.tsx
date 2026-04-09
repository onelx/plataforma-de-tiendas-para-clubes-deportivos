'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Store,
  ShoppingBag,
  DollarSign,
  CalendarPlus,
  Plus,
  ExternalLink,
  Settings,
} from 'lucide-react';
import type { Club } from '@/types';

interface ClubWithCount extends Club {
  pedidos: { count: number }[];
}

interface GlobalStats {
  total_clubs: number;
  total_pedidos: number;
  ventas_totales: number;
  clubs_este_mes: number;
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL;

  const [clubs, setClubs] = useState<ClubWithCount[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    total_clubs: 0,
    total_pedidos: 0,
    ventas_totales: 0,
    clubs_este_mes: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && !isSuperAdmin) router.push('/dashboard');
  }, [user, isLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!user || !isSuperAdmin) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [clubsRes, statsRes] = await Promise.all([
          fetch('/api/admin/clubs'),
          fetch('/api/admin/stats'),
        ]);

        if (clubsRes.ok) {
          const data = await clubsRes.json();
          setClubs(data);
        }

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, isSuperAdmin]);

  if (isLoading || (!user && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  const statCards = [
    {
      title: 'Clubs Activos',
      value: stats.total_clubs.toString(),
      icon: Store,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Pedidos Totales',
      value: stats.total_pedidos.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Ventas Totales',
      value: `$${stats.ventas_totales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Clubs Este Mes',
      value: stats.clubs_este_mes.toString(),
      icon: CalendarPlus,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Superadmin</h1>
          <p className="text-gray-500 mt-1">Vista global de la plataforma</p>
        </div>
        <Link href="/admin/clubs/nuevo">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Crear Club
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

      {/* Clubs table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Todos los Clubs</CardTitle>
          <Link href="/admin/clubs/nuevo">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nuevo Club
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay clubs creados aún</p>
              <Link href="/admin/clubs/nuevo">
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primer club
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Nombre</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Slug</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Color</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Estado</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Pedidos</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Comisión</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => {
                    const pedidosCount = club.pedidos?.[0]?.count ?? 0;
                    return (
                      <tr key={club.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium text-gray-900">{club.nombre}</td>
                        <td className="py-3 px-2">
                          <a
                            href={`/${club.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-mono text-xs"
                          >
                            {club.slug}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                              style={{ backgroundColor: club.color_primario }}
                              title={club.color_primario}
                            />
                            <div
                              className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                              style={{ backgroundColor: club.color_secundario }}
                              title={club.color_secundario}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge
                            className={
                              club.activo
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }
                          >
                            {club.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right text-gray-700">{pedidosCount}</td>
                        <td className="py-3 px-2 text-right text-gray-700">
                          {club.comision_porcentaje}%
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Link href={`/admin/clubs/${club.id}`}>
                            <Button variant="outline" size="sm">
                              <Settings className="w-3.5 h-3.5 mr-1" />
                              Gestionar
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
