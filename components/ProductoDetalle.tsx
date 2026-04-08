'use client';

import { useState } from 'react';
import { Producto, VarianteProducto } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface ProductoDetalleProps {
  producto: Producto;
}

export function ProductoDetalle({ producto }: ProductoDetalleProps) {
  const { addItem } = useCart();
  const [selectedTalla, setSelectedTalla] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);
  const [imagenActual, setImagenActual] = useState(0);

  const imagenes = Array.isArray(producto.imagenes) && producto.imagenes.length > 0
    ? producto.imagenes
    : ['/placeholder-product.jpg'];

  const tallas = [...new Set(producto.variantes?.map(v => v.talla).filter(Boolean) || [])];
  const colores = [...new Set(producto.variantes?.map(v => v.color).filter(Boolean) || [])];

  const varianteSeleccionada = producto.variantes?.find(
    v => 
      (tallas.length === 0 || v.talla === selectedTalla) &&
      (colores.length === 0 || v.color === selectedColor)
  );

  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(producto.precio_base);

  const handleAddToCart = () => {
    if (tallas.length > 0 && !selectedTalla) {
      toast.error('Por favor selecciona una talla');
      return;
    }

    if (colores.length > 0 && !selectedColor) {
      toast.error('Por favor selecciona un color');
      return;
    }

    if (!varianteSeleccionada) {
      toast.error('Variante no disponible');
      return;
    }

    addItem({
      producto_id: producto.id,
      variante_id: varianteSeleccionada.id,
      cantidad,
      precio_unitario: producto.precio_base,
      producto: {
        nombre: producto.nombre,
        imagen: imagenes[0],
      },
      variante: {
        talla: varianteSeleccionada.talla,
        color: varianteSeleccionada.color,
        sku: varianteSeleccionada.sku,
      },
    });

    toast.success(`${cantidad} ${cantidad === 1 ? 'producto agregado' : 'productos agregados'} al carrito`);
  };

  const puedeAgregarAlCarrito = producto.activo && 
    (tallas.length === 0 || selectedTalla) && 
    (colores.length === 0 || selectedColor) &&
    varianteSeleccionada?.activo;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Galería de imágenes */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={imagenes[imagenActual]}
            alt={producto.nombre}
            className="object-cover w-full h-full"
          />
          
          {!producto.activo && (
            <Badge 
              variant="secondary" 
              className="absolute top-4 right-4 bg-red-500 text-white"
            >
              No disponible
            </Badge>
          )}
        </div>

        {imagenes.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {imagenes.map((img, index) => (
              <button
                key={index}
                onClick={() => setImagenActual(index)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                  imagenActual === index 
                    ? 'border-primary' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={img}
                  alt={`${producto.nombre} - Vista ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="space-y-6">
        <div>
          {producto.categoria && (
            <Badge variant="secondary" className="mb-2">
              {producto.categoria}
            </Badge>
          )}
          <h1 className="text-3xl font-bold mb-2">{producto.nombre}</h1>
          <p className="text-3xl font-bold text-primary">{precioFormateado}</p>
        </div>

        {producto.descripcion && (
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-gray-600 whitespace-pre-line">{producto.descripcion}</p>
          </div>
        )}

        {/* Selector de talla */}
        {tallas.length > 0 && (
          <div>
            <Label className="mb-3 block">Talla</Label>
            <RadioGroup value={selectedTalla} onValueChange={setSelectedTalla}>
              <div className="flex gap-2 flex-wrap">
                {tallas.map((talla) => {
                  const variantesConTalla = producto.variantes?.filter(v => v.talla === talla && v.activo) || [];
                  const disponible = variantesConTalla.length > 0;
                  
                  return (
                    <div key={talla}>
                      <RadioGroupItem
                        value={talla || ''}
                        id={`talla-${talla}`}
                        className="peer sr-only"
                        disabled={!disponible}
                      />
                      <Label
                        htmlFor={`talla-${talla}`}
                        className={`flex items-center justify-center px-4 py-2 border-2 rounded-md cursor-pointer transition-all ${
                          disponible
                            ? 'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white hover:border-gray-400'
                            : 'opacity-50 cursor-not-allowed bg-gray-100'
                        }`}
                      >
                        {talla}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Selector de color */}
        {colores.length > 0 && (
          <div>
            <Label className="mb-3 block">Color</Label>
            <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
              <div className="flex gap-2 flex-wrap">
                {colores.map((color) => {
                  const variantesConColor = producto.variantes?.filter(v => 
                    v.color === color && 
                    v.activo &&
                    (tallas.length === 0 || v.talla === selectedTalla)
                  ) || [];
                  const disponible = variantesConColor.length > 0;

                  return (
                    <div key={color}>
                      <RadioGroupItem
                        value={color || ''}
                        id={`color-${color}`}
                        className="peer sr-only"
                        disabled={!disponible}
                      />
                      <Label
                        htmlFor={`color-${color}`}
                        className={`flex flex-col items-center gap-1 cursor-pointer ${
                          disponible ? '' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            disponible
                              ? 'peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:ring-offset-2'
                              : 'border-gray-300'
                          }`}
                          style={{ 
                            backgroundColor: color?.toLowerCase(),
                          }}
                        />
                        <span className="text-xs">{color}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Selector de cantidad */}
        <div>
          <Label className="mb-3 block">Cantidad</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              disabled={cantidad <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-semibold">{cantidad}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCantidad(Math.min(99, cantidad + 1))}
              disabled={cantidad >= 99}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Botón de agregar al carrito */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!puedeAgregarAlCarrito}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Agregar al carrito
        </Button>

        {/* Información adicional */}
        <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
          <p>✓ Producto fabricado bajo demanda</p>
          <p>✓ Envío a todo el país</p>
          <p>✓ Pago seguro con Stripe</p>
          {varianteSeleccionada?.sku && (
            <p className="text-xs text-gray-500">SKU: {varianteSeleccionada.sku}</p>
          )}
        </div>
      </div>
    </div>
  );
}
