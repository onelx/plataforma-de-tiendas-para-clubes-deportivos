'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Check } from 'lucide-react'
import { Producto, VarianteProducto } from '@/types'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { formatPrice, cn } from '@/lib/utils'

interface ProductoDetalleProps {
  producto: Producto
  clubSlug: string
}

// Vista detallada del producto con selector de variantes
export function ProductoDetalle({ producto, clubSlug }: ProductoDetalleProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariante, setSelectedVariante] = useState<VarianteProducto | null>(
    producto.variantes?.[0] || null
  )
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  // Obtener tallas y colores únicos
  const tallas = [...new Set(producto.variantes?.map((v) => v.talla) || [])]
  const colores = [...new Set(producto.variantes?.map((v) => v.color) || [])]

  const handleAddToCart = () => {
    if (!selectedVariante) return
    addItem(producto, selectedVariante, clubSlug)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const selectVariante = (talla?: string, color?: string) => {
    const variante = producto.variantes?.find(
      (v) =>
        (talla ? v.talla === talla : v.talla === selectedVariante?.talla) &&
        (color ? v.color === color : v.color === selectedVariante?.color)
    )
    if (variante) setSelectedVariante(variante)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Galería de imágenes */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={producto.imagenes?.[selectedImage] || '/placeholder-product.jpg'}
            alt={producto.nombre}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Miniaturas */}
        {producto.imagenes && producto.imagenes.length > 1 && (
          <div className="flex gap-2">
            {producto.imagenes.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative w-20 h-20 rounded-lg overflow-hidden border-2',
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                )}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Información y opciones */}
      <div className="space-y-6">
        <div>
          <span className="text-sm text-gray-500 uppercase tracking-wide">
            {producto.categoria}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            {producto.nombre}
          </h1>
          <p className="text-2xl font-bold text-primary mt-2">
            {formatPrice(producto.precio_base)}
          </p>
        </div>

        <p className="text-gray-600">{producto.descripcion}</p>

        {/* Selector de talla */}
        {tallas.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talla
            </label>
            <div className="flex flex-wrap gap-2">
              {tallas.map((talla) => (
                <button
                  key={talla}
                  onClick={() => selectVariante(talla)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                    selectedVariante?.talla === talla
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 hover:border-primary'
                  )}
                >
                  {talla}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de color */}
        {colores.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colores.map((color) => (
                <button
                  key={color}
                  onClick={() => selectVariante(undefined, color)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                    selectedVariante?.color === color
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 hover:border-primary'
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón añadir al carrito */}
        <Button
          onClick={handleAddToCart}
          disabled={!selectedVariante}
          size="lg"
          className="w-full"
        >
          {added ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              ¡Añadido!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Añadir al carrito
            </>
          )}
        </Button>

        {/* SKU */}
        {selectedVariante && (
          <p className="text-sm text-gray-400">SKU: {selectedVariante.sku}</p>
        )}
      </div>
    </div>
  )
}
