"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Producto, VarianteProducto } from "@/types";

interface CartState {
  items: CartItem[];
  clubSlug: string | null;
  
  // Acciones
  addItem: (producto: Producto, variante: VarianteProducto, clubSlug: string) => void;
  removeItem: (varianteId: string) => void;
  updateQuantity: (varianteId: string, cantidad: number) => void;
  clearCart: () => void;
  
  // Computed
  getTotal: () => number;
  getItemCount: () => number;
}

// Hook del carrito con persistencia en localStorage
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      clubSlug: null,

      addItem: (producto, variante, clubSlug) => {
        const { items, clubSlug: currentClubSlug } = get();
        
        // Si el carrito es de otro club, lo vaciamos
        if (currentClubSlug && currentClubSlug !== clubSlug) {
          set({ items: [], clubSlug });
        }

        // Verificamos si ya existe el item
        const existingIndex = items.findIndex(
          (item) => item.variante.id === variante.id
        );

        if (existingIndex >= 0) {
          // Incrementar cantidad
          const newItems = [...items];
          newItems[existingIndex].cantidad += 1;
          set({ items: newItems, clubSlug });
        } else {
          // Agregar nuevo item
          set({
            items: [...items, { producto, variante, cantidad: 1 }],
            clubSlug,
          });
        }
      },

      removeItem: (varianteId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variante.id !== varianteId),
        }));
      },

      updateQuantity: (varianteId, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(varianteId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.variante.id === varianteId ? { ...item, cantidad } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], clubSlug: null });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.producto.precio_base * item.cantidad,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.cantidad, 0);
      },
    }),
    {
      name: "club-store-cart",
    }
  )
);
