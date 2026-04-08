'use client'

import { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface CarritoDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// Drawer lateral del carrito
export function CarritoDrawer({ isOpen, onClose }: CarritoDrawerProps) {
  const { items, updateQuantity, removeItem, getTotal, clubSlug } = useCart()

  if (!isOpen) return null

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Tu carrito
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.variante.id}
                  className="flex gap-4 bg-gray-50 rounded-lg p-3"
                >
                  {/* Imagen */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white">
                    <Image
                      src={item.producto.imagenes?.[0] || '/placeholder-product.jpg'}
                      alt={item.producto.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.producto.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.variante.talla} / {item.variante.color}
                    </p>
                    <p className="font-semibold text-primary mt-1">
                      {formatPrice(item.producto.precio_base)}
                    </p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.variante.id, item.cantidad - 1)
                        }
                        className="p-1 hover:bg-white rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variante.id, item.cantidad + 1)
                        }
                        className="p-1 hover:bg-white rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.variante.id)}
                        className="ml-auto text-red-500 hover:text-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con total y checkout */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <Link href={`/tienda/${clubSlug}/checkout`} onClick={onClose}>
              <Button className="w-full" size="lg">
                Finalizar compra
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Fragment>
  )
}
