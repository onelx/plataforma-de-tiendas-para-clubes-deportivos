"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Producto, VarianteProducto, CartItem } from '@/types';

interface UseCartReturn {
  items: CartItem[];
  addItem: (producto: Producto, variante: VarianteProducto | null, cantidad: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isLoading: boolean;
}

const CART_STORAGE_KEY = 'ideaforge_cart';

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizar con localStorage cuando cambian los items
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, isLoading]);

  // Sincronizar entre pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const newItems = JSON.parse(e.newValue);
          setItems(newItems);
        } catch (error) {
          console.error('Error syncing cart across tabs:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addItem = useCallback((producto: Producto, variante: VarianteProducto | null, cantidad: number) => {
    setItems(currentItems => {
      const itemId = `${producto.id}-${variante?.id ?? 'sin-variante'}`;
      const existingItemIndex = currentItems.findIndex(
        item => item.producto.id === producto.id && item.variante?.id === variante?.id
      );

      if (existingItemIndex > -1) {
        // Item ya existe, actualizar cantidad
        const newItems = [...currentItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          cantidad: newItems[existingItemIndex].cantidad + cantidad,
        };
        return newItems;
      } else {
        // Nuevo item
        const newItem: CartItem = {
          id: itemId,
          producto,
          variante,
          cantidad,
          precio_unitario: producto.precio_base,
        };
        return [...currentItems, newItem];
      }
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, cantidad } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.precio_unitario * item.cantidad,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    isLoading,
  };
}
