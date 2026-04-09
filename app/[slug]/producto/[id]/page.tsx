"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useClub } from "@/hooks/useClub";
import { TiendaLayout } from "@/components/TiendaLayout";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Producto, VarianteProducto } from "@/types";

interface ProductoPageProps {
  params: { slug: string; id: string };
}

// Página de detalle de producto
export default function ProductoPage({ params }: ProductoPageProps) {
  const router = useRouter();
  const { club, isLoading: clubLoading } = useClub(params.slug);
  const { addItem } = useCart();
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariante, setSelectedVariante] = useState<VarianteProducto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  // Cargar producto
  useEffect(() => {
    async function fetchProducto() {
      const supabase = createClient();
      
      const { data: productoData } = await supabase
        .from("productos")
        .select(`
          *,
          variantes:variantes_producto(*)
        `)
        .eq("id", params.id)
        .eq("activo", true)
        .single();

      if (productoData) {
        setProducto(productoData as Producto);
        // Seleccionar primera variante por defecto
        if (productoData.variantes?.length > 0) {
          setSelectedVariante(productoData.variantes[0]);
        }
      }
      setLoading(false);
    }

    fetchProducto();
  }, [params.id]);

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!producto || !club) return;
    // Si hay variantes, requiere selección; si no hay, selectedVariante puede ser null
    const variantes = producto.variantes || [];
    if (variantes.length > 0 && !selectedVariante) return;

    addItem(producto, selectedVariante, cantidad);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Obtener tallas y colores únicos
  const tallas = [...new Set(producto?.variantes?.map(v => v.talla) || [])];
  const colores = [...new Set(producto?.variantes?.map(v => v.color) || [])];

  if (loading || clubLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!producto || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Producto no encontrado</p>
      </div>
    );
  }

  return (
    <TiendaLayout club={club}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Volver
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden">
              <Image
                src={producto.imagenes?.[selectedImage] || "/placeholder-product.jpg"}
                alt={producto.nombre}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            {producto.imagenes && producto.imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {producto.imagenes.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index ? "border-club-primary" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div>
            <p className="text-sm text-gray-500 mb-2">{producto.categoria}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{producto.nombre}</h1>
            <p className="text-2xl font-bold text-club-primary mb-6">
              {formatPrice(producto.precio_base)}
            </p>

            <p className="text-gray-600 mb-8">{producto.descripcion}</p>

            {/* Selector de talla */}
            {tallas.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Talla</label>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla) => {
                    const varianteDisponible = producto.variantes?.find(
                      v => v.talla === talla && v.activo
                    );
                    const isSelected = selectedVariante?.talla === talla;
                    
                    return (
                      <button
                        key={talla}
                        onClick={() => {
                          const variante = producto.variantes?.find(
                            v => v.talla === talla && (selectedVariante?.color ? v.color === selectedVariante.color : true)
                          );
                          if (variante) setSelectedVariante(variante);
                        }}
                        disabled={!varianteDisponible}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                          isSelected 
                            ? "border-club-primary bg-club-primary text-white"
                            : varianteDisponible
                              ? "border-gray-200 hover:border-gray-300"
                              : "border-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {talla}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector de color */}
            {colores.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color) => {
                    const isSelected = selectedVariante?.color === color;
                    
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          const variante = producto.variantes?.find(
                            v => v.color === color && (selectedVariante?.talla ? v.talla === selectedVariante.talla : true)
                          );
                          if (variante) setSelectedVariante(variante);
                        }}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                          isSelected 
                            ? "border-club-primary bg-club-primary text-white"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector de cantidad */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">Cantidad</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="p-2 rounded-lg border hover:bg-gray-100"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-xl font-medium w-12 text-center">{cantidad}</span>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="p-2 rounded-lg border hover:bg-gray-100"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Botón de agregar al carrito */}
            <Button
              onClick={handleAddToCart}
              disabled={(producto.variantes?.length ?? 0) > 0 && !selectedVariante}
              size="lg"
              className="w-full"
            >
              {added ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  ¡Agregado!
                </>
              ) : (
                "Agregar al carrito"
              )}
            </Button>

            {/* Info adicional */}
            <div className="mt-8 pt-8 border-t space-y-4 text-sm text-gray-600">
              <p>✓ Fabricado bajo demanda en 3-5 días hábiles</p>
              <p>✓ Envío a toda España</p>
              <p>✓ Devoluciones en 14 días</p>
            </div>
          </div>
        </div>
      </div>
    </TiendaLayout>
  );
}
