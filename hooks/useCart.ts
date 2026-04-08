import { useState, useEffect, useCallback } from 'react';
import { CartItem, Producto, VarianteProducto } from '@/types';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const CART_STORAGE_KEY = 'club_store_cart';

export function useCart() {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartState;
        setCart(parsed);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isLoading]);

  // Sincronizar carrito entre pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const newCart = JSON.parse(e.newValue) as CartState;
          setCart(newCart);
        } catch (error) {
          console.error('Error syncing cart across tabs:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const calculateTotal = useCallback((items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
  }, []);

  const calculateItemCount = useCallback((items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
  }, []);

  const addItem = useCallback(
    (producto: Producto, variante: VarianteProducto, cantidad: number = 1) => {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.items.findIndex(
          (item) =>
            item.producto_id === producto.id && item.variante_id === variante.id
        );

        let newItems: CartItem[];

        if (existingItemIndex > -1) {
          // Actualizar cantidad del item existente
          newItems = [...prevCart.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            cantidad: newItems[existingItemIndex].cantidad + cantidad,
          };
        } else {
          // Agregar nuevo item
          const newItem: CartItem = {
            id: `${producto.id}-${variante.id}`,
            producto_id: producto.id,
            variante_id: variante.id,
            producto_nombre: producto.nombre,
            producto_imagen: Array.isArray(producto.imagenes) && producto.imagenes.length > 0
              ? producto.imagenes[0]
              : '',
            variante_talla: variante.talla,
            variante_color: variante.color,
            variante_sku: variante.sku,
            cantidad,
            precio_unitario: producto.precio_base,
          };
          newItems = [...prevCart.items, newItem];
        }

        return {
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        };
      });
    },
    [calculateTotal, calculateItemCount]
  );

  const updateQuantity = useCallback(
    (itemId: string, cantidad: number) => {
      if (cantidad < 1) {
        removeItem(itemId);
        return;
      }

      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) =>
          item.id === itemId ? { ...item, cantidad } : item
        );

        return {
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        };
      });
    },
    [calculateTotal, calculateItemCount]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.id !== itemId);

        return {
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        };
      });
    },
    [calculateTotal, calculateItemCount]
  );

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
    });
  }, []);

  const getItem = useCallback(
    (productoId: string, varianteId: string): CartItem | undefined => {
      return cart.items.find(
        (item) => item.producto_id === productoId && item.variante_id === varianteId
      );
    },
    [cart.items]
  );

  const hasItem = useCallback(
    (productoId: string, varianteId: string): boolean => {
      return cart.items.some(
        (item) => item.producto_id === productoId && item.variante_id === varianteId
      );
    },
    [cart.items]
  );

  return {
    items: cart.items,
    total: cart.total,
    itemCount: cart.itemCount,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItem,
    hasItem,
  };
}
