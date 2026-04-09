"use client";

import React from "react";
import Link from "next/link";
import { Producto, VarianteProducto } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductoCardProps {
  producto: Producto;
  clubSlug: string;
  clubPrimaryColor?: string;
}

export function ProductoCard({
  producto,
  clubSlug,
  clubPrimaryColor = "#1e40af",
}: ProductoCardProps) {
  const imagenes = producto.imagenes || [];
  const primeraImagen = imagenes.length > 0 ? imagenes[0] : "/placeholder-product.jpg";

  const variantes = producto.variantes || [];
  const tallasDisponibles = [
    ...new Set(variantes.filter((v) => v.activo).map((v) => v.talla)),
  ];
  const coloresDisponibles = [
    ...new Set(variantes.filter((v) => v.activo).map((v) => v.color)),
  ];

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(precio);
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/${clubSlug}/producto/${producto.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={primeraImagen}
            alt={producto.nombre}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {!producto.activo && (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 bg-gray-900 text-white"
            >
              No disponible
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/${clubSlug}/producto/${producto.id}`}>
          <h3 className="mb-2 font-semibold text-gray-900 transition-colors hover:opacity-80">
            {producto.nombre}
          </h3>
        </Link>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600">
          {producto.descripcion}
        </p>

        <div className="mb-3 flex items-center gap-2">
          {tallasDisponibles.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Tallas:</span>
              <div className="flex gap-1">
                {tallasDisponibles.slice(0, 4).map((talla) => (
                  <Badge
                    key={talla}
                    variant="outline"
                    className="h-6 px-2 text-xs"
                  >
                    {talla}
                  </Badge>
                ))}
                {tallasDisponibles.length > 4 && (
                  <Badge variant="outline" className="h-6 px-2 text-xs">
                    +{tallasDisponibles.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {coloresDisponibles.length > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Colores:</span>
            <div className="flex gap-1">
              {coloresDisponibles.slice(0, 5).map((color) => (
                <div
                  key={color}
                  className="h-5 w-5 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color?.toLowerCase() }}
                  title={color ?? ''}
                />
              ))}
              {coloresDisponibles.length > 5 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-[10px]">
                  +{coloresDisponibles.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatearPrecio(producto.precio_base)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/${clubSlug}/producto/${producto.id}`} className="w-full">
          <Button
            className="w-full"
            style={{ backgroundColor: clubPrimaryColor }}
            disabled={!producto.activo}
          >
            {producto.activo ? "Ver Detalles" : "No Disponible"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
