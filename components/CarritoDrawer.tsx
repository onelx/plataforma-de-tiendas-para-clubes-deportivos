'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/hooks/useCart';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface CarritoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubSlug: string;
}

export function CarritoDrawer({ open, onOpenChange, clubSlug }: CarritoDrawerProps) {
  const { items, removeItem, updateQuantity, total } = useCart();
  const totalFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(total);

  const handleIncrement = (itemId: string, currentQuantity: number) => {
    if (currentQuantity < 10) {
      updateQuantity(itemId, currentQuantity + 1);
    }
  };

  const handleDecrement = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Carrito de Compras
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-gray-600 mb-6">
              Agrega productos para comenzar tu compra
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Continuar comprando
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => {
                  const subtotal = item.precio_unitario * item.cantidad;
                  const subtotalFormateado = new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                  }).format(subtotal);

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="h-20 w-20 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden">
                        <img
                          src={item.producto.imagenes?.[0] || '/placeholder-product.jpg'}
                          alt={item.producto.nombre}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.jpg'; }}
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 line-clamp-1">
                              {item.producto.nombre}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.variante ? `${item.variante.talla ?? ''} / ${item.variante.color ?? ''}` : ''}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDecrement(item.id, item.cantidad)}
                              disabled={item.cantidad <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.cantidad}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleIncrement(item.id, item.cantidad)}
                              disabled={item.cantidad >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {subtotalFormateado}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t bg-gray-50 px-6 py-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{totalFormateado}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">Calculado en checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{totalFormateado}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                asChild
              >
                <Link href={`/${clubSlug}/checkout`} onClick={() => onOpenChange(false)}>
                  Ir al Checkout
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Continuar comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
