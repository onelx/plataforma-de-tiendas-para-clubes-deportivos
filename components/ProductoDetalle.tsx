'use client';

import { useState } from 'react';
import { Producto, VarianteProducto } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface ProductoDetalleProps {
  producto: Producto;
  clubColorPrimario?: string;
}

export function ProductoDetalle({ producto, clubColorPrimario }: ProductoDetalleProps) {
  const [imagenActual, setImagenActual] = useState(0);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>('');
  const [colorSeleccionado, setColorSeleccionado] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();

  const imagenes = producto.imagenes || ['/placeholder-product.png'];
  const variantesActivas = producto.variantes?.filter(v => v.activo) || [];
  const tallas = Array.from(new Set(variantesActivas.map(v => v.talla).filter(Boolean)));
  const colores = Array.from(new Set(variantesActivas.map(v => v.color).filter(Boolean)));

  const varianteSeleccionada = variantesActivas.find(
    v =>
      (!tallaSeleccionada || v.talla === tallaSeleccionada) &&
      (!colorSeleccionado || v.color === colorSeleccionado)
  );

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio);
  };

  const handleAgregarCarrito = () => {
    if (!varianteSeleccionada) {
      toast({
        title: 'Selección incompleta',
        description: 'Por favor selecciona talla y color',
        variant: 'destructive',
      });
      return;
    }

    addItem({
      producto_id: producto.id,
      variante_id: varianteSeleccionada.id,
      cantidad,
      precio_unitario: producto.precio_base,
      nombre_producto: producto.nombre,
      talla: varianteSeleccionada.talla,
      color: varianteSeleccionada.color,
      imagen: imagenes[0],
    });

    toast({
      title: 'Agregado al carrito',
      description: `${cantidad}x ${producto.nombre} agregado correctamente`,
    });
  };

  const aumentarCantidad = () => setCantidad(prev => prev + 1);
  const disminuirCantidad = () => setCantidad(prev => Math.max(1, prev - 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={imagenes[imagenActual]}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        </div>

        {imagenes.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {imagenes.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setImagenActual(idx)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                  imagenActual === idx ? 'border-gray-900' : 'border-gray-200'
                }`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{producto.nombre}</h1>
          {producto.categoria && (
            <Badge variant="secondary" className="mb-4">
              {producto.categoria}
            </Badge>
          )}
          <p className="text-3xl font-bold" style={{ color: clubColorPrimario }}>
            {formatearPrecio(producto.precio_base)}
          </p>
        </div>

        {producto.descripcion && (
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-gray-600 whitespace-pre-line">{producto.descripcion}</p>
          </div>
        )}

        {tallas.length > 0 && (
          <div>
            <Label className="mb-3 block font-semibold">Talla</Label>
            <RadioGroup value={tallaSeleccionada} onValueChange={setTallaSeleccionada}>
              <div className="flex flex-wrap gap-2">
                {tallas.map(talla => (
                  <div key={talla}>
                    <RadioGroupItem value={talla || ''} id={`talla-${talla}`} className="sr-only" />
                    <Label
                      htmlFor={`talla-${talla}`}
                      className={`cursor-pointer px-4 py-2 border-2 rounded-md transition-colors ${
                        tallaSeleccionada === talla
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {talla}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {colores.length > 0 && (
          <div>
            <Label className="mb-3 block font-semibold">Color</Label>
            <RadioGroup value={colorSeleccionado} onValueChange={setColorSeleccionado}>
              <div className="flex flex-wrap gap-3">
                {colores.map(color => (
                  <div key={color}>
                    <RadioGroupItem value={color || ''} id={`color-${color}`} className="sr-only" />
                    <Label
                      htmlFor={`color-${color}`}
                      className={`cursor-pointer flex flex-col items-center gap-1`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          colorSeleccionado === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-gray-600">{color}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        <div>
          <Label className="mb-3 block font-semibold">Cantidad</Label>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={disminuirCantidad}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xl font-semibold w-12 text-center">{cantidad}</span>
            <Button variant="outline" size="icon" onClick={aumentarCantidad}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleAgregarCarrito}
          disabled={!producto.activo || !varianteSeleccionada}
          style={{
            backgroundColor: clubColorPrimario,
            color: 'white',
          }}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Agregar al Carrito
        </Button>

        {!producto.activo && (
          <p className="text-red-600 text-sm">Producto no disponible actualmente</p>
        )}
      </div>
    </div>
  );
}
