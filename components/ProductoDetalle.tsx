"use client";

import React, { useState } from "react";
import { Producto, VarianteProducto } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductoDetalleProps {
  producto: Producto;
  clubPrimaryColor?: string;
  onAddToCart: (
    productoId: string,
    varianteId: string,
    cantidad: number
  ) => void;
}

export function ProductoDetalle({
  producto,
  clubPrimaryColor = "#1e40af",
  onAddToCart,
}: ProductoDetalleProps) {
  const { toast } = useToast();
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>("");
  const [colorSeleccionado, setColorSeleccionado] = useState<string>("");
  const [cantidad, setCantidad] = useState(1);

  const imagenes = producto.imagenes as { url: string; alt?: string }[];
  const variantes = producto.variantes || [];

  const tallasDisponibles = [
    ...new Set(variantes.filter((v) => v.activo).map((v) => v.talla)),
  ];

  const coloresDisponiblesParaTalla = tallaSeleccionada
    ? [
        ...new Set(
          variantes
            .filter((v) => v.activo && v.talla === tallaSeleccionada)
            .map((v) => v.color)
        ),
      ]
    : [];

  const varianteSeleccionada = variantes.find(
    (v) =>
      v.activo && v.talla === tallaSeleccionada && v.color === colorSeleccionado
  );

  const handleAgregarAlCarrito = () => {
    if (!varianteSeleccionada) {
      toast({
        title: "Selección incompleta",
        description: "Por favor selecciona talla y color",
        variant: "destructive",
      });
      return;
    }

    onAddToCart(producto.id, varianteSeleccionada.id, cantidad);

    toast({
      title: "Producto agregado",
      description: `${cantidad}x ${producto.nombre} agregado al carrito`,
    });

    setCantidad(1);
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(precio);
  };

  const incrementarCantidad = () => {
    if (cantidad < 10) setCantidad(cantidad + 1);
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          {imagenes && imagenes.length > 0 && (
            <img
              src={imagenes[imagenSeleccionada].url}
              alt={imagenes[imagenSeleccionada].alt || producto.nombre}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {imagenes && imagenes.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {imagenes.map((imagen, index) => (
              <button
                key={index}
                onClick={() => setImagenSeleccionada(index)}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  imagenSeleccionada === index
                    ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={imagen.url}
                  alt={imagen.alt || `${producto.nombre} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {producto.nombre}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{producto.categoria}</Badge>
            {!producto.activo && (
              <Badge variant="destructive">No disponible</Badge>
            )}
          </div>
        </div>

        <div className="border-b pb-6">
          <p className="text-4xl font-bold text-gray-900">
            {formatearPrecio(producto.precio_base)}
          </p>
        </div>

        <div>
          <p className="text-gray-600">{producto.descripcion}</p>
        </div>

        {tallasDisponibles.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Selecciona Talla</Label>
            <RadioGroup
              value={tallaSeleccionada}
              onValueChange={(value) => {
                setTallaSeleccionada(value);
                setColorSeleccionado("");
              }}
            >
              <div className="grid grid-cols-4 gap-2">
                {tallasDisponibles.map((talla) => (
                  <div key={talla}>
                    <RadioGroupItem
                      value={talla}
                      id={`talla-${talla}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`talla-${talla}`}
                      className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-gray-300 p-3 font-semibold transition-all hover:border-gray-400 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50"
                    >
                      {talla}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {tallaSeleccionada && coloresDisponiblesParaTalla.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Selecciona Color</Label>
            <RadioGroup
              value={colorSeleccionado}
              onValueChange={setColorSeleccionado}
            >
              <div className="grid grid-cols-5 gap-2">
                {coloresDisponiblesParaTalla.map((color) => (
                  <div key={color}>
                    <RadioGroupItem
                      value={color}
                      id={`color-${color}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`color-${color}`}
                      className="flex cursor-pointer flex-col items-center gap-2"
                    >
                      <div
                        className="h-12 w-12 rounded-full border-4 border-gray-300 transition-all peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-blue-600 peer-data-[state=checked]:ring-offset-2"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      <span className="text-xs font-medium">{color}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-base font-semibold">Cantidad</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementarCantidad}
              disabled={cantidad <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-xl font-semibold">
              {cantidad}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={incrementarCantidad}
              disabled={cantidad >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="bg-gray-50 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">
                {formatearPrecio(producto.precio_base * cantidad)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Envío:</span>
              <span>Calculado en el checkout</span>
            </div>
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full text-lg"
          style={{ backgroundColor: clubPrimaryColor }}
          onClick={handleAgregarAlCarrito}
          disabled={!producto.activo || !varianteSeleccionada}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Agregar al Carrito
        </Button>

        <div className="space-y-2 text-sm text-gray-600">
          <p>✓ Producto fabricado bajo demanda</p>
          <p>✓ Calidad garantizada</p>
          <p>✓ Envíos a todo el país</p>
          <p>✓ Tiempo de producción: 7-10 días hábiles</p>
        </div>
      </div>
    </div>
  );
}
