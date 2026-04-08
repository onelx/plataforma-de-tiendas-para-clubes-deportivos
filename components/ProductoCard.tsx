'use client';

import Link from 'next/link';
import { Producto } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ProductoCardProps {
  producto: Producto;
  clubSlug: string;
}

export function ProductoCard({ producto, clubSlug }: ProductoCardProps) {
  const imagenPrincipal = Array.isArray(producto.imagenes) && producto.imagenes.length > 0
    ? producto.imagenes[0]
    : '/placeholder-product.jpg';

  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(producto.precio_base);

  const tieneTallas = producto.variantes && producto.variantes.some(v => v.talla);
  const tieneColores = producto.variantes && producto.variantes.some(v => v.color);
  const coloresDisponibles = tieneColores
    ? [...new Set(producto.variantes?.map(v => v.color).filter(Boolean))]
    : [];

  return (
    <Link href={`/${clubSlug}/productos/${producto.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imagenPrincipal}
            alt={producto.nombre}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          
          {!producto.activo && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 bg-red-500 text-white"
            >
              No disponible
            </Badge>
          )}

          {producto.categoria && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-white/90 text-gray-800"
            >
              {producto.categoria}
            </Badge>
          )}
        </div>

        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {producto.nombre}
          </h3>
          
          {producto.descripcion && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {producto.descripcion}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-2">
            {tieneTallas && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Tallas:</span>
                <span className="text-xs font-medium">
                  {[...new Set(producto.variantes?.map(v => v.talla).filter(Boolean))].join(', ')}
                </span>
              </div>
            )}
          </div>

          {tieneColores && coloresDisponibles.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Colores:</span>
              <div className="flex gap-1">
                {coloresDisponibles.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color?.toLowerCase() }}
                    title={color || ''}
                  />
                ))}
                {coloresDisponibles.length > 4 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{coloresDisponibles.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="w-full">
            <p className="text-2xl font-bold text-primary">
              {precioFormateado}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Precio base
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
