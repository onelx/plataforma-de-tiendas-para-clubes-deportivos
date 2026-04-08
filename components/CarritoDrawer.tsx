'use client';

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPrice } from '@/lib/utils';
import { ItemCarrito } from '@/types';

interface CarritoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ItemCarrito[];
  onUpdateCantidad: (varianteId: string, cantidad: number) => void;
  onRemoveItem: (varianteId: string) => void;
  onClearCart: () => void;
  clubSlug: string;
}

export function CarritoDrawer({
  open,
  onOpenChange,
  items,
  onUpdateCantidad,
  onRemoveItem,
  onClearCart,
  clubSlug,
}: CarritoDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  const handleIncrement = (varianteId: string, currentCantidad: number) => {
    if (currentCantidad < 10) {
      onUpdateCantidad(varianteId, currentCantidad + 1);
    }
  };

  const handleDecrement = (varianteId: string, currentCantidad: number) => {
    if (currentCantidad > 1) {
      onUpdateCantidad(varianteId, currentCantidad - 1);
    } else {
      onRemoveItem(varianteId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Carrito ({itemCount})
            </span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="text-destructive hover:text-destructive"
              >
                Vaciar
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-4">
              Agregá productos para comenzar tu compra
            </p>
            <Button onClick={() => onOpenChange(false)} asChild>
              <Link href={`/${clubSlug}/productos`}>Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.variante.id} className="flex gap-4">
                    {/* Imagen del producto */}
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.producto.imagenes?.[0] || '/placeholder-product.png'}
                        alt={item.producto.nombre}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                        {item.producto.nombre}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="capitalize">{item.variante.talla}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: item.variante.color.toLowerCase() }}
                          />
                          <span className="capitalize">{item.variante.color}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {/* Selector de cantidad */}
                        <div className="flex items-center gap-1 border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDecrement(item.variante.id, item.cantidad)}
                          >
                            {item.cantidad === 1 ? (
                              <Trash2 className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.cantidad}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleIncrement(item.variante.id, item.cantidad)}
                            disabled={item.cantidad >= 10}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Precio */}
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(item.precio_unitario * item.cantidad)}
                          </p>
                          {item.cantidad > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.precio_unitario)} c/u
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => onRemoveItem(item.variante.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <SheetFooter className="flex-col gap-4">
              {/* Resumen */}
              <div className="space-y-2 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium">Calculado en checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  asChild
                >
                  <Link href={`/${clubSlug}/productos`}>Seguir comprando</Link>
                </Button>
                <Button asChild>
                  <Link href={`/${clubSlug}/checkout`}>
                    Finalizar compra
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
