'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Loader2,
  ArrowLeft,
  Save,
  ExternalLink,
  UserPlus,
  AlertTriangle,
  Info,
  Plus,
  Edit3,
  Trash2,
  X,
  Package,
  Image as ImageIcon,
} from 'lucide-react';
import type { Club, UsuarioClub, Producto, VarianteProducto } from '@/types';

interface UsuarioClubWithEmail extends UsuarioClub {
  email: string | null;
}

interface ProductoConVariantes extends Omit<Producto, 'variantes'> {
  variantes: VarianteProducto[];
}

interface VarianteForm {
  talla: string;
  color: string;
}

const emptyProductoForm = {
  nombre: '',
  descripcion: '',
  precio_base: '',
  costo_produccion: '',
  categoria: '',
  imagenes: [] as string[],
};

export default function AdminClubDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;
  const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL;
  const supabase = createClientComponentClient();

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

  // Products state
  const [productos, setProductos] = useState<ProductoConVariantes[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<ProductoConVariantes | null>(null);
  const [submittingProducto, setSubmittingProducto] = useState(false);
  const [productoError, setProductoError] = useState<string | null>(null);
  const [productoForm, setProductoForm] = useState(emptyProductoForm);
  const [variantes, setVariantes] = useState<VarianteForm[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  useEffect(() => {
    if (!user || !isSuperAdmin || !clubId) return;
    fetchProductos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSuperAdmin, clubId]);

  const fetchProductos = async () => {
    setLoadingProductos(true);
    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/productos`);
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (err) {
      console.error('Error fetching productos:', err);
    } finally {
      setLoadingProductos(false);
    }
  };

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

  // Image upload helper
  const resizeAndUpload = async (file: File): Promise<string> => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = objectUrl; });
    URL.revokeObjectURL(objectUrl);

    const MAX = 1200;
    let { width, height } = img;
    if (width > MAX || height > MAX) {
      if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
      else { width = Math.round(width * MAX / height); height = MAX; }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85)
    );

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { data, error } = await supabase.storage
      .from('productos')
      .upload(filename, blob, { contentType: 'image/jpeg', upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('productos')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  // Product handlers
  const openAddProductSheet = () => {
    setEditingProducto(null);
    setProductoForm(emptyProductoForm);
    setVariantes([]);
    setProductoError(null);
    setProductSheetOpen(true);
  };

  const openEditProductSheet = (producto: ProductoConVariantes) => {
    setEditingProducto(producto);
    setProductoForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_base: String(producto.precio_base),
      costo_produccion: String(producto.costo_produccion),
      categoria: producto.categoria || '',
      imagenes: producto.imagenes || [],
    });
    setVariantes(
      (producto.variantes || []).map((v) => ({
        talla: v.talla || '',
        color: v.color || '',
      }))
    );
    setProductoError(null);
    setProductSheetOpen(true);
  };

  const handleProductoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductoError(null);
    setSubmittingProducto(true);

    const body = {
      nombre: productoForm.nombre,
      descripcion: productoForm.descripcion || undefined,
      precio_base: parseFloat(productoForm.precio_base) || 0,
      costo_produccion: parseFloat(productoForm.costo_produccion) || 0,
      categoria: productoForm.categoria || undefined,
      imagenes: productoForm.imagenes,
      variantes: variantes
        .filter((v) => v.talla || v.color)
        .map((v) => ({ talla: v.talla || undefined, color: v.color || undefined })),
    };

    try {
      let res: Response;
      if (editingProducto) {
        res = await fetch(`/api/admin/clubs/${clubId}/productos/${editingProducto.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/admin/clubs/${clubId}/productos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setProductoError(data.error || 'Error al guardar producto');
        return;
      }

      setProductSheetOpen(false);
      await fetchProductos();
    } catch (err) {
      console.error(err);
      setProductoError('Error de conexión');
    } finally {
      setSubmittingProducto(false);
    }
  };

  const toggleProductoActivo = async (producto: ProductoConVariantes) => {
    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/productos/${producto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !producto.activo }),
      });

      if (res.ok) {
        setProductos((prev) =>
          prev.map((p) => (p.id === producto.id ? { ...p, activo: !producto.activo } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProducto = async (producto: ProductoConVariantes) => {
    if (!confirm(`¿Seguro que deseas eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/productos/${producto.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== producto.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addVarianteRow = () => {
    setVariantes((prev) => [...prev, { talla: '', color: '' }]);
  };

  const removeVarianteRow = (index: number) => {
    setVariantes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariante = (index: number, field: 'talla' | 'color', value: string) => {
    setVariantes((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
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

        {/* Section 3: Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Productos
              </CardTitle>
              <Button size="sm" onClick={openAddProductSheet}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Producto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingProductos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay productos todavía.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Agrega el primer producto haciendo clic en &quot;Agregar Producto&quot;.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Nombre</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Categoría</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-500">Precio Base</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-500">Costo Prod.</th>
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
                          ${producto.precio_base.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          ${producto.costo_produccion.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="secondary">
                            {producto.variantes?.length || 0} variantes
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => toggleProductoActivo(producto)}
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
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditProductSheet(producto)}
                              className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProducto(producto)}
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

        {/* Section 4: Danger zone */}
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

      {/* Product Sheet */}
      <Sheet open={productSheetOpen} onOpenChange={setProductSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleProductoSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="p_nombre">Nombre *</Label>
              <Input
                id="p_nombre"
                value={productoForm.nombre}
                onChange={(e) => setProductoForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
                placeholder="Camiseta oficial"
                disabled={submittingProducto}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p_descripcion">Descripción</Label>
              <textarea
                id="p_descripcion"
                value={productoForm.descripcion}
                onChange={(e) => setProductoForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                placeholder="Descripción del producto..."
                disabled={submittingProducto}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p_precio_base">Precio base</Label>
                <Input
                  id="p_precio_base"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productoForm.precio_base}
                  onChange={(e) => setProductoForm((prev) => ({ ...prev, precio_base: e.target.value }))}
                  placeholder="0.00"
                  disabled={submittingProducto}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_costo_produccion">Costo producción</Label>
                <Input
                  id="p_costo_produccion"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productoForm.costo_produccion}
                  onChange={(e) => setProductoForm((prev) => ({ ...prev, costo_produccion: e.target.value }))}
                  placeholder="0.00"
                  disabled={submittingProducto}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p_categoria">Categoría</Label>
              <Input
                id="p_categoria"
                value={productoForm.categoria}
                onChange={(e) => setProductoForm((prev) => ({ ...prev, categoria: e.target.value }))}
                placeholder="Camisetas, Accesorios..."
                disabled={submittingProducto}
              />
            </div>

            <Separator />

            {/* Imágenes */}
            <div>
              <Label>Imágenes del producto</Label>

              {/* Preview of uploaded images */}
              {productoForm.imagenes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {productoForm.imagenes.map((url, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                      <button
                        type="button"
                        onClick={() => setProductoForm(f => ({ ...f, imagenes: f.imagenes.filter((_, j) => j !== i) }))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <label className="mt-2 flex items-center gap-2 cursor-pointer">
                <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-gray-600">
                  {uploadingImage ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Subiendo...</>
                  ) : (
                    <><ImageIcon className="w-4 h-4" />Subir imagen</>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    try {
                      const url = await resizeAndUpload(file);
                      setProductoForm(f => ({ ...f, imagenes: [...f.imagenes, url] }));
                    } catch (err) {
                      console.error('Upload error:', err);
                      alert('Error al subir la imagen. Verificá que el bucket "productos" existe en Supabase Storage.');
                    } finally {
                      setUploadingImage(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
              <p className="text-xs text-gray-400 mt-1">Máx 1200px, se convierte a JPEG automáticamente</p>
            </div>

            <Separator />

            {/* Variantes section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Variantes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVarianteRow}
                  disabled={submittingProducto}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar Variante
                </Button>
              </div>

              {variantes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">
                  Sin variantes. Haz clic en &quot;Agregar Variante&quot; para añadir tallas/colores.
                </p>
              ) : (
                <div className="space-y-2">
                  {variantes.map((variante, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Talla (S, M, L...)"
                        value={variante.talla}
                        onChange={(e) => updateVariante(index, 'talla', e.target.value)}
                        disabled={submittingProducto}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Color (Azul, Rojo...)"
                        value={variante.color}
                        onChange={(e) => updateVariante(index, 'color', e.target.value)}
                        disabled={submittingProducto}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeVarianteRow(index)}
                        disabled={submittingProducto}
                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {productoError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">{productoError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submittingProducto}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {submittingProducto ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Producto'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProductSheetOpen(false)}
                disabled={submittingProducto}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
