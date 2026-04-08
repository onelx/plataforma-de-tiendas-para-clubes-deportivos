'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

const checkoutSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  direccion: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
  ciudad: z.string().min(2, 'Ciudad inválida'),
  provincia: z.string().min(2, 'Provincia inválida'),
  codigo_postal: z.string().min(4, 'Código postal inválido'),
  notas: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  subtotal: number;
  costoEnvio: number;
  onSubmit: (data: CheckoutFormData) => Promise<void>;
}

export function CheckoutForm({ subtotal, costoEnvio, onSubmit }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      codigo_postal: '',
      notas: '',
    },
  });

  const handleSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error en checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal + costoEnvio;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Formulario de datos */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Información de envío
            </CardTitle>
            <CardDescription>
              Completá tus datos para recibir el pedido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input placeholder="Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Teléfono */}
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+54 11 1234-5678"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Dirección */}
                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Calle Falsa 123, Piso 4, Depto B"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ciudad y Provincia */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ciudad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Buenos Aires" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="provincia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input placeholder="Buenos Aires" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Código Postal */}
                <FormField
                  control={form.control}
                  name="codigo_postal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notas */}
                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Timbre roto, llamar al llegar"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Botón de pago (solo visible en mobile) */}
        <div className="lg:hidden">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pagar {formatPrice(total)}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resumen del pedido */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-medium">{formatPrice(costoEnvio)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-start gap-2">
                <span>•</span>
                <span>El pago se procesa de forma segura con Stripe</span>
              </p>
              <p className="flex items-start gap-2">
                <span>•</span>
                <span>Recibirás un email de confirmación</span>
              </p>
              <p className="flex items-start gap-2">
                <span>•</span>
                <span>El envío puede demorar 5-7 días hábiles</span>
              </p>
            </div>

            {/* Botón de pago (desktop) */}
            <div className="hidden lg:block pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
                onClick={form.handleSubmit(handleSubmit)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pagar {formatPrice(total)}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
