'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Wand2, Store } from 'lucide-react';

function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function NuevoClubPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL;

  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    color_primario: '#1d4ed8',
    color_secundario: '#ffffff',
    comision_porcentaje: 15,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  const handleGenerateSlug = () => {
    setForm((prev) => ({ ...prev, slug: generateSlug(prev.nombre) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear el club');
        return;
      }

      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Club</h1>
          <p className="text-gray-500 mt-1">Configura un nuevo club deportivo en la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Club</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Club *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Club Atlético Rivadavia"
                    value={form.nombre}
                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      placeholder="club-atletico-rivadavia"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        }))
                      }
                      required
                      disabled={loading}
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateSlug}
                      disabled={!form.nombre || loading}
                    >
                      <Wand2 className="w-4 h-4 mr-1" />
                      Generar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Solo minúsculas, números y guiones. La tienda estará en /{form.slug || 'slug'}
                  </p>
                </div>

                <Separator />

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color_primario">Color Primario</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="color_primario"
                        value={form.color_primario}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, color_primario: e.target.value }))
                        }
                        disabled={loading}
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5"
                      />
                      <Input
                        value={form.color_primario}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, color_primario: e.target.value }))
                        }
                        placeholder="#1d4ed8"
                        disabled={loading}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color_secundario">Color Secundario</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="color_secundario"
                        value={form.color_secundario}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, color_secundario: e.target.value }))
                        }
                        disabled={loading}
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5"
                      />
                      <Input
                        value={form.color_secundario}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, color_secundario: e.target.value }))
                        }
                        placeholder="#ffffff"
                        disabled={loading}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Comision */}
                <div className="space-y-2">
                  <Label htmlFor="comision">Comisión de Plataforma (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="comision"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={form.comision_porcentaje}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          comision_porcentaje: parseFloat(e.target.value) || 0,
                        }))
                      }
                      disabled={loading}
                      className="w-32"
                    />
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Porcentaje que retiene la plataforma de cada venta
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Club'
                    )}
                  </Button>
                  <Link href="/admin">
                    <Button type="button" variant="outline" disabled={loading}>
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Store header preview */}
              <div
                className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                style={{ backgroundColor: form.color_primario }}
              >
                <div className="p-6 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: form.color_secundario }}
                  >
                    <Store
                      className="w-6 h-6"
                      style={{ color: form.color_primario }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-bold text-lg leading-tight"
                      style={{ color: form.color_secundario }}
                    >
                      {form.nombre || 'Nombre del Club'}
                    </h3>
                    <p
                      className="text-sm opacity-80"
                      style={{ color: form.color_secundario }}
                    >
                      Tienda Oficial
                    </p>
                  </div>
                </div>

                {/* Mock nav */}
                <div
                  className="px-6 pb-4 flex gap-4"
                  style={{ color: form.color_secundario, opacity: 0.7 }}
                >
                  <span className="text-sm font-medium">Productos</span>
                  <span className="text-sm">Mi Pedido</span>
                  <span className="text-sm">Contacto</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>URL de la tienda:</span>
                  <span className="font-mono text-indigo-600">/{form.slug || 'slug'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisión:</span>
                  <span className="font-semibold text-gray-900">{form.comision_porcentaje}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
