'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Loader2, Plus, Trash2, Edit3 } from 'lucide-react';
import type { Producto } from '@/types';

interface ProductoConVariantes extends Omit<Producto, 'variantes'> {
  variantes: { id: string }[];
}

export default function ProductosPage() {
  const { usuarioClub } = useAuth();
  const supabase = createClientComponentClient();

  const [productos, setProductos] = useState<ProductoConVariantes[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio_base: '',
    costo_produccion: '',
    categoria: '',
  });

  const fetchProductos = useCallback(async () => {
    if (!usuarioClub?.club_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*, variantes:variantes_producto(id)')
      .eq('club_id', usuarioClub.club_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProductos(data as ProductoConVariantes[]);
    }
    setLoading(false);
  }, [usuarioClub, supabase]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioClub?.club_id) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/dashboard/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_id: usuarioClub.club_id,
          nombre: form.nombre,
          descripcion: form.descripcion || undefined,
          precio_base: parseFloat(form.precio_base) || 0,
          costo_produccion: parseFloat(form.costo_produccion) || 0,
          categoria: form.categoria || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear producto');
      }

      setForm({ nombre: '', descripcion: '', precio_base: '', costo_produccion: '', categoria: '' });
      setSheetOpen(false);
      await fetchProductos();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    await fetch(`/api/dashboard/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !activo }),
    });
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activo: !activo } : p))
    );
  };

  const deleteProducto = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    await fetch(`/api/dashboard/productos/${id}`, { method: 'DELETE' });
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Gestiona el catálogo de tu tienda</p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Nuevo Producto</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  placeholder="Camiseta oficial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Descripción del producto..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio_base">Precio base *</Label>
                  <Input
                    id="precio_base"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio_base}
                    onChange={(e) => setForm({ ...form, precio_base: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costo_produccion">Costo producción</Label>
                  <Input
                    id="costo_produccion"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costo_produccion}
                    onChange={(e) => setForm({ ...form, costo_produccion: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  placeholder="Ropa, Accesorios..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Crear Producto'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSheetOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay productos todavía.</p>
              <p className="text-sm text-gray-400 mt-1">Crea tu primer producto haciendo clic en "Nuevo Producto".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Nombre</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Categoría</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Precio Base</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Variantes</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Estado</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">{producto.nombre}</td>
                      <td className="py-3 px-2 text-gray-500">{producto.categoria || '-'}</td>
                      <td className="py-3 px-2 text-right">
                        ${producto.precio_base.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant="secondary">{producto.variantes?.length || 0}</Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => toggleActivo(producto.id, producto.activo)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            producto.activo
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => deleteProducto(producto.id)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
