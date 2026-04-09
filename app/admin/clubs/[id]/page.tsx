'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  ArrowLeft,
  Save,
  ExternalLink,
  UserPlus,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { Club, UsuarioClub } from '@/types';

interface UsuarioClubWithEmail extends UsuarioClub {
  email: string | null;
}

export default function AdminClubDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;
  const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL;

  const [club, setClub] = useState<Club | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioClubWithEmail[]>([]);
  const [loadingClub, setLoadingClub] = useState(true);
  const [savingClub, setSavingClub] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    color_primario: '#1d4ed8',
    color_secundario: '#ffffff',
    activo: true,
    comision_porcentaje: 15,
  });

  const [newUser, setNewUser] = useState({
    auth_user_id: '',
    rol: 'admin' as UsuarioClub['rol'],
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && !isSuperAdmin) router.push('/dashboard');
  }, [user, isLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!user || !isSuperAdmin || !clubId) return;

    const fetchClub = async () => {
      setLoadingClub(true);
      try {
        const [clubRes, usersRes] = await Promise.all([
          fetch(`/api/admin/clubs/${clubId}`),
          fetch(`/api/admin/clubs/${clubId}/usuarios`),
        ]);

        if (clubRes.ok) {
          const data: Club = await clubRes.json();
          setClub(data);
          setForm({
            nombre: data.nombre,
            color_primario: data.color_primario,
            color_secundario: data.color_secundario,
            activo: data.activo,
            comision_porcentaje: data.comision_porcentaje,
          });
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsuarios(data);
        }
      } catch (err) {
        console.error('Error fetching club:', err);
        setError('Error al cargar el club');
      } finally {
        setLoadingClub(false);
      }
    };

    fetchClub();
  }, [user, isSuperAdmin, clubId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSavingClub(true);

    try {
      const res = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar');
        return;
      }

      setClub(data);
      setSuccessMsg('Club actualizado correctamente');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setSavingClub(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('¿Estás seguro de que quieres desactivar este club?')) return;
    setDeactivating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false }),
      });

      if (res.ok) {
        setForm((prev) => ({ ...prev, activo: false }));
        setClub((prev) => (prev ? { ...prev, activo: false } : null));
        setSuccessMsg('Club desactivado');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al desactivar');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setDeactivating(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAddingUser(true);

    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al agregar usuario');
        return;
      }

      setUsuarios((prev) => [...prev, { ...data, email: null }]);
      setNewUser({ auth_user_id: '', rol: 'admin' });
      setSuccessMsg('Usuario agregado correctamente');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setAddingUser(false);
    }
  };

  if (isLoading || loadingClub) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  if (!club) {
    return (
      <div className="p-8">
        <p className="text-red-600">Club no encontrado</p>
        <Link href="/admin">
          <Button className="mt-4" variant="outline">Volver al panel</Button>
        </Link>
      </div>
    );
  }

  const rolColors: Record<string, string> = {
    admin: 'bg-indigo-100 text-indigo-800',
    editor: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: club.color_primario }}
              />
              <h1 className="text-3xl font-bold text-gray-900">{club.nombre}</h1>
              <Badge
                className={
                  club.activo
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : 'bg-red-100 text-red-800 hover:bg-red-100'
                }
              >
                {club.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1 font-mono text-sm">/{club.slug}</p>
          </div>
        </div>
        <a
          href={`/${club.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            Ver tienda
          </Button>
        </a>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Edit club */}
        <Card>
          <CardHeader>
            <CardTitle>Editar Club</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  required
                  disabled={savingClub}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cp">Color Primario</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="cp"
                      value={form.color_primario}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, color_primario: e.target.value }))
                      }
                      disabled={savingClub}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5"
                    />
                    <Input
                      value={form.color_primario}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, color_primario: e.target.value }))
                      }
                      disabled={savingClub}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cs">Color Secundario</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="cs"
                      value={form.color_secundario}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, color_secundario: e.target.value }))
                      }
                      disabled={savingClub}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5"
                    />
                    <Input
                      value={form.color_secundario}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, color_secundario: e.target.value }))
                      }
                      disabled={savingClub}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

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
                    disabled={savingClub}
                    className="w-32"
                  />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Label htmlFor="activo" className="cursor-pointer">Estado del Club</Label>
                <button
                  type="button"
                  id="activo"
                  onClick={() => setForm((prev) => ({ ...prev, activo: !prev.activo }))}
                  disabled={savingClub}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    form.activo ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.activo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">{form.activo ? 'Activo' : 'Inactivo'}</span>
              </div>

              <Button
                type="submit"
                disabled={savingClub}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {savingClub ? (
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

        {/* Section 2: Usuarios admin */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Administradores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Info box */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-md p-3">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Para agregar un nuevo administrador, primero crea su cuenta en el panel de Supabase
                Auth, obtén su <strong>User ID (UUID)</strong> y luego vincúlalo aquí.
              </p>
            </div>

            {/* Current users list */}
            {usuarios.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay usuarios vinculados a este club
              </p>
            ) : (
              <div className="space-y-2">
                {usuarios.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {u.email || 'Email no disponible'}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">{u.auth_user_id}</p>
                    </div>
                    <Badge className={rolColors[u.rol] || 'bg-gray-100 text-gray-800'}>
                      {u.rol}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Add user form */}
            <form onSubmit={handleAddUser} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Agregar Usuario Admin
              </h3>
              <div className="space-y-2">
                <Label htmlFor="auth_user_id">User ID (UUID de Supabase Auth)</Label>
                <Input
                  id="auth_user_id"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={newUser.auth_user_id}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, auth_user_id: e.target.value }))}
                  required
                  disabled={addingUser}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <select
                  id="rol"
                  value={newUser.rol}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, rol: e.target.value as UsuarioClub['rol'] }))
                  }
                  disabled={addingUser}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={addingUser}
              >
                {addingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Section 3: Danger zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Peligro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Desactivar Club</p>
                <p className="text-sm text-gray-500 mt-1">
                  La tienda pública dejará de estar accesible para los clientes.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                onClick={handleDeactivate}
                disabled={deactivating || !form.activo}
              >
                {deactivating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Desactivando...
                  </>
                ) : (
                  'Desactivar Club'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
