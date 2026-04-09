"use client";

import React, { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import Link from "next/link";
import { Club } from "@/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { CarritoDrawer } from "@/components/CarritoDrawer";

interface TiendaLayoutProps {
  club: Club;
  children: React.ReactNode;
}

export function TiendaLayout({ club, children }: TiendaLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();

  const primaryColor = club.color_primario || "#1e40af";
  const secondaryColor = club.color_secundario || "#3b82f6";

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        :root {
          --club-primary: ${primaryColor};
          --club-secondary: ${secondaryColor};
        }
      `}</style>

      <header
        className="sticky top-0 z-50 border-b bg-white shadow-sm"
        style={{ borderBottomColor: primaryColor }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${club.slug}`} className="flex items-center gap-3">
                {club.logo_url && (
                  <img
                    src={club.logo_url}
                    alt={`Logo ${club.nombre}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <span
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {club.nombre}
                </span>
              </Link>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href={`/${club.slug}`}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                Inicio
              </Link>
              <Link
                href={`/${club.slug}/productos`}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                Productos
              </Link>
              <Link
                href={`/${club.slug}/sobre-nosotros`}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                Sobre Nosotros
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {itemCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="border-t py-4 md:hidden">
              <div className="flex flex-col gap-3">
                <Link
                  href={`/${club.slug}`}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  href={`/${club.slug}/productos`}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Productos
                </Link>
                <Link
                  href={`/${club.slug}/sobre-nosotros`}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sobre Nosotros
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3
                className="mb-4 text-lg font-bold"
                style={{ color: primaryColor }}
              >
                {club.nombre}
              </h3>
              <p className="text-sm text-gray-600">
                Tienda oficial del {club.nombre}. Todos los productos son
                fabricados bajo demanda con la más alta calidad.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-900">
                Enlaces
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    href={`/${club.slug}`}
                    className="hover:text-gray-900"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${club.slug}/productos`}
                    className="hover:text-gray-900"
                  >
                    Productos
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${club.slug}/rastrear`}
                    className="hover:text-gray-900"
                  >
                    Rastrear Pedido
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-900">
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/terminos" className="hover:text-gray-900">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-gray-900">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/devoluciones" className="hover:text-gray-900">
                    Política de Devoluciones
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            <p>
              © {new Date().getFullYear()} {club.nombre}. Todos los derechos
              reservados.
            </p>
            <p className="mt-2">
              Plataforma desarrollada por{" "}
              <span style={{ color: primaryColor }}>IdeaForge</span>
            </p>
          </div>
        </div>
      </footer>
      <CarritoDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        clubSlug={club.slug}
      />
    </div>
  );
}
