'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import type { Club } from '@/types';

export default function ConfiguracionPage() {
  const { usuarioClub } = useAuth();
  const supabase = createClientComponentClient();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    color_primario: '#1d4ed8',
    color_secundario: '#64748b',
  });

  const fetchClub = useCallback(async () => {
    if (!usuarioClub?.club_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', usuarioClub.club_id)
      .single();

    if (data) {
      setClub(data as Club);
      setForm({
        nombre: data.nombre || '',
        color_primario: data.color_primario || '#1d4ed8',
        color_secundario: data.color_secundario || '#64748b',
      });
    }
    setLoading(false);
  }, [usuarioClub, supabase]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/dashboard/club/${club.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          color_primario: form.color_primario,
          color_secundario: form.color_secundario,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      setSuccess(true);
      await fetchClub();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Personaliza la apariencia de tu tienda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Club</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (solo lectura)</Label>
                <Input
                  id="slug"
                  value={club?.slug || ''}
                  readOnly
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400">
                  URL de tu tienda: /tienda/{club?.slug}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Club</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  placeholder="Mi Club Deportivo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color_primario">Color Primario</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="color_primario"
                      type="color"
                      value={form.color_primario}
                      onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={form.color_primario}
                      onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
                      placeholder="#1d4ed8"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color_secundario">Color Secundario</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="color_secundario"
                      type="color"
                      value={form.color_secundario}
                      onChange={(e) => setForm({ ...form, color_secundario: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={form.color_secundario}
                      onChange={(e) => setForm({ ...form, color_secundario: e.target.value })}
                      placeholder="#64748b"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-700">Cambios guardados correctamente.</p>
                </div>
              )}

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa de Colores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="rounded-lg p-6 text-white"
                style={{ backgroundColor: form.color_primario }}
              >
                <p className="font-bold text-lg">{form.nombre || 'Nombre del Club'}</p>
                <p className="text-sm opacity-80 mt-1">Color primario</p>
                <div className="mt-3">
                  <button
                    className="px-4 py-2 rounded text-sm font-medium"
                    style={{ backgroundColor: form.color_secundario, color: '#fff' }}
                  >
                    Comprar Ahora
                  </button>
                </div>
              </div>

              <div
                className="rounded-lg p-6 text-white"
                style={{ backgroundColor: form.color_secundario }}
              >
                <p className="font-bold">Color Secundario</p>
                <p className="text-sm opacity-80 mt-1">{form.color_secundario}</p>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 text-center">
                  <div
                    className="w-full h-12 rounded-lg mb-2"
                    style={{ backgroundColor: form.color_primario }}
                  />
                  <p className="text-xs text-gray-500 font-mono">{form.color_primario}</p>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="w-full h-12 rounded-lg mb-2"
                    style={{ backgroundColor: form.color_secundario }}
                  />
                  <p className="text-xs text-gray-500 font-mono">{form.color_secundario}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
