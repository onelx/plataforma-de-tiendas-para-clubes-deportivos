'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';
import type { Pedido, EstadoPedido } from '@/types';

const estadoConfig: Record<EstadoPedido, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  pagado: { label: 'Pagado', className: 'bg-blue-100 text-blue-800' },
  produccion: { label: 'Producción', className: 'bg-purple-100 text-purple-800' },
  enviado: { label: 'Enviado', className: 'bg-orange-100 text-orange-800' },
  entregado: { label: 'Entregado', className: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
};

const estadoOptions: EstadoPedido[] = ['pendiente', 'pagado', 'produccion', 'enviado', 'entregado', 'cancelado'];

export default function PedidosPage() {
  const { usuarioClub } = useAuth();
  const supabase = createClientComponentClient();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [updatingEstado, setUpdatingEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPedido>('pendiente');

  const fetchPedidos = useCallback(async () => {
    if (!usuarioClub?.club_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('club_id', usuarioClub.club_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPedidos(data as Pedido[]);
    }
    setLoading(false);
  }, [usuarioClub, supabase]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const openDetail = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setNuevoEstado(pedido.estado);
    setSheetOpen(true);
  };

  const handleUpdateEstado = async () => {
    if (!selectedPedido) return;
    setUpdatingEstado(true);
    try {
      const res = await fetch(`/api/dashboard/pedidos/${selectedPedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        const updated = { ...selectedPedido, estado: nuevoEstado };
        setSelectedPedido(updated);
        setPedidos((prev) =>
          prev.map((p) => (p.id === selectedPedido.id ? updated : p))
        );
      }
    } finally {
      setUpdatingEstado(false);
    }
  };

  const formatFecha = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 mt-1">Gestiona los pedidos de tu tienda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay pedidos aún.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">N° Pedido</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Fecha</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Total</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => {
                    const cfg = estadoConfig[pedido.estado];
                    return (
                      <tr
                        key={pedido.id}
                        className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => openDetail(pedido)}
                      >
                        <td className="py-3 px-2 font-medium text-blue-600">
                          {pedido.numero_pedido}
                        </td>
                        <td className="py-3 px-2 text-gray-900">{pedido.cliente_nombre}</td>
                        <td className="py-3 px-2 text-gray-500">{pedido.cliente_email}</td>
                        <td className="py-3 px-2 text-gray-500">{formatFecha(pedido.created_at)}</td>
                        <td className="py-3 px-2 text-right font-medium">
                          ${pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
                          >
                            {cfg.label}
                          </span>
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

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalle del Pedido</SheetTitle>
          </SheetHeader>

          {selectedPedido && (
            <div className="mt-6 space-y-6">
              {/* Order info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Información del Pedido</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">N° Pedido:</span>
                    <span className="font-medium">{selectedPedido.numero_pedido}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-medium">
                      ${selectedPedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado actual:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoConfig[selectedPedido.estado].className}`}
                    >
                      {estadoConfig[selectedPedido.estado].label}
                    </span>
                  </div>
                  {selectedPedido.tracking_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tracking:</span>
                      <span className="font-medium">{selectedPedido.tracking_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Información del Cliente</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nombre:</span>
                    <span>{selectedPedido.cliente_nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span>{selectedPedido.cliente_email}</span>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              {selectedPedido.direccion_envio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Dirección de Envío</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {selectedPedido.direccion_envio.nombre} {selectedPedido.direccion_envio.apellido}
                    </p>
                    <p>{selectedPedido.direccion_envio.direccion}</p>
                    <p>
                      {selectedPedido.direccion_envio.ciudad}, {selectedPedido.direccion_envio.provincia}{' '}
                      {selectedPedido.direccion_envio.codigo_postal}
                    </p>
                    <p>{selectedPedido.direccion_envio.pais}</p>
                    {selectedPedido.direccion_envio.telefono && (
                      <p>Tel: {selectedPedido.direccion_envio.telefono}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Update estado */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Actualizar Estado</h3>
                <div className="flex gap-3">
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value as EstadoPedido)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {estadoOptions.map((estado) => (
                      <option key={estado} value={estado}>
                        {estadoConfig[estado].label}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={handleUpdateEstado}
                    disabled={updatingEstado || nuevoEstado === selectedPedido.estado}
                    size="sm"
                  >
                    {updatingEstado ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Actualizar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
