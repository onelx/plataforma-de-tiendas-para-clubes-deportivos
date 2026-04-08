'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TiendaLayout from '@/components/TiendaLayout';
import { useCart } from '@/hooks/useCart';
import { useClub } from '@/hooks/useClub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { club, loading: clubLoading } = useClub(params.slug as string);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    notas: ''
  });

  useEffect(() => {
    if (items.length === 0 && !clubLoading) {
      router.push(`/${params.slug}`);
    }
  }, [items, clubLoading, router, params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pedidoData = {
        club_id: club?.id,
        items: items.map(item => ({
          producto_id: item.producto.id,
          variante_id: item.variante?.id,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio_base
        })),
        cliente: {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono
        },
        direccion_envio: {
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          codigo_postal: formData.codigoPostal
        },
        notas: formData.notas
      };

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      });

      if (!res.ok) {
        throw new Error('Error al crear pedido');
      }

      const { pedido_id } = await res.json();

      const checkoutRes = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id,
          success_url: `${window.location.origin}/${params.slug}/pedido/${pedido_id}?success=true`,
          cancel_url: `${window.location.origin}/${params.slug}/checkout`
        })
      });

      if (!checkoutRes.ok) {
        throw new Error('Error al crear sesión de pago');
      }

      const { url } = await checkoutRes.json();

      clearCart();
      window.location.href = url;
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intentá de nuevo.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (clubLoading || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <TiendaLayout club={club}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dirección de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ciudad">Ciudad *</Label>
                      <Input
                        id="ciudad"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="provincia">Provincia *</Label>
                      <Input
                        id="provincia"
                        name="provincia"
                        value={formData.provincia}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="codigoPostal">Código Postal *</Label>
                    <Input
                      id="codigoPostal"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notas">Notas del Pedido (opcional)</Label>
                    <textarea
                      id="notas"
                      name="notas"
                      value={formData.notas}
                      onChange={handleChange}
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      placeholder="Instrucciones especiales para la entrega..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Proceder al Pago'
                )}
              </Button>
            </form>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div key={`${item.producto.id}-${item.variante?.id}`} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.producto.nombre}</p>
                      {item.variante && (
                        <p className="text-gray-500">
                          {item.variante.color} / {item.variante.talla}
                        </p>
                      )}
                      <p className="text-gray-500">Cantidad: {item.cantidad}</p>
                    </div>
                    <p className="font-medium">
                      ${(item.producto.precio_base * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>Calculado en el pago</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TiendaLayout>
  );
}
