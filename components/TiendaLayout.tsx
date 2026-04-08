'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Club } from '@/types';

interface TiendaLayoutProps {
  children: ReactNode;
  club: Club;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export function TiendaLayout({ children, club, cartItemCount = 0, onOpenCart }: TiendaLayoutProps) {
  const primaryColor = club.color_primario || '#000000';
  const secondaryColor = club.color_secundario || '#ffffff';

  return (
    <div className="min-h-screen flex flex-col" style={{ '--club-primary': primaryColor, '--club-secondary': secondaryColor } as React.CSSProperties}>
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{ 
          backgroundColor: primaryColor,
          color: secondaryColor
        }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo y nombre */}
          <Link href={`/${club.slug}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {club.logo_url && (
              <div className="relative w-10 h-10">
                <Image
                  src={club.logo_url}
                  alt={club.nombre}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <span className="font-bold text-xl hidden sm:inline">{club.nombre}</span>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href={`/${club.slug}`}
              className="hover:opacity-80 transition-opacity font-medium"
            >
              Inicio
            </Link>
            <Link 
              href={`/${club.slug}/productos`}
              className="hover:opacity-80 transition-opacity font-medium"
            >
              Productos
            </Link>
            <Link 
              href={`/${club.slug}/contacto`}
              className="hover:opacity-80 transition-opacity font-medium"
            >
              Contacto
            </Link>
          </nav>

          {/* Carrito */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onOpenCart}
              style={{ color: secondaryColor }}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ 
                    backgroundColor: secondaryColor,
                    color: primaryColor
                  }}
                >
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Button>

            {/* Menú móvil */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" style={{ color: secondaryColor }}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    href={`/${club.slug}`}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    Inicio
                  </Link>
                  <Link 
                    href={`/${club.slug}/productos`}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    Productos
                  </Link>
                  <Link 
                    href={`/${club.slug}/contacto`}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    Contacto
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer 
        className="border-t mt-auto"
        style={{ 
          backgroundColor: primaryColor,
          color: secondaryColor
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Info del club */}
            <div>
              <h3 className="font-bold text-lg mb-3">{club.nombre}</h3>
              <p className="text-sm opacity-90">
                Tienda oficial con productos exclusivos del club.
              </p>
            </div>

            {/* Enlaces */}
            <div>
              <h3 className="font-bold text-lg mb-3">Enlaces</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={`/${club.slug}`} className="hover:opacity-80 transition-opacity">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href={`/${club.slug}/productos`} className="hover:opacity-80 transition-opacity">
                    Productos
                  </Link>
                </li>
                <li>
                  <Link href={`/${club.slug}/contacto`} className="hover:opacity-80 transition-opacity">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            {/* Info legal */}
            <div>
              <h3 className="font-bold text-lg mb-3">Información</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terminos" className="hover:opacity-80 transition-opacity">
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:opacity-80 transition-opacity">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/envios" className="hover:opacity-80 transition-opacity">
                    Envíos y devoluciones
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-current/20 text-center text-sm opacity-80">
            <p>© {new Date().getFullYear()} {club.nombre}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
