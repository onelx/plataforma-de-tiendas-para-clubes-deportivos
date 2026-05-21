"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import type { Club } from "@/types";
import { useCart } from "@/hooks/useCart";
import { CarritoDrawer } from "@/components/CarritoDrawer";
import { useToast } from "@/components/ui/use-toast";

interface TiendaLayoutProps {
  club: Club;
  children: React.ReactNode;
}

const F_DISPLAY = "var(--font-display, 'Space Grotesk', system-ui, sans-serif)";
const F_MONO = "var(--font-mono, 'Space Mono', ui-monospace, monospace)";
const INK = "#0a0a0a";
const PAPER = "#fafaf7";
const LINE = "#e6e4dd";

export function TiendaLayout({ club, children }: TiendaLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { itemCount, total } = useCart();
  const pathname = usePathname();
  const { toast } = useToast();

  const accent = club.color_primario || "#FF4D1F";
  const slug = club.slug;

  const navLinks = [
    { href: `/${slug}`, label: "Inicio" },
    { href: `/${slug}/productos`, label: "Productos" },
    { href: `/${slug}/sobre-nosotros`, label: "Sobre Nosotros" },
  ];

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({ title: "¡Gracias por suscribirte!", description: "Te avisamos cuando haya novedades del club." });
    setEmail("");
  };

  return (
    <div style={{ "--accent": accent } as React.CSSProperties}>

      {/* ─── STICKY HEADER GROUP ─────────────────── */}
      <div className="sticky top-0 z-50" style={{ background: PAPER }}>

        {/* Topbar */}
        <div style={{ background: INK, color: "#bdbcb5", fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".05em" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 38, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="hidden md:flex items-center gap-6">
              <Link href={`/${slug}/sobre-nosotros`} style={{ color: "#bdbcb5", opacity: 0.7, textDecoration: "none", transition: "opacity .15s" }} className="hover:opacity-100">
                Sobre {club.nombre}
              </Link>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#bdbcb5" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, display: "inline-block" }} />
                Envíos a todo el país · Fabricado bajo demanda
              </span>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".05em", display: "flex", gap: 4 }}
            >
              Carrito · <span style={{ color: accent, fontWeight: 500 }}>{itemCount}</span> · {fmt(total)}
            </button>
          </div>
        </div>

        {/* Header */}
        <header style={{ background: PAPER, borderBottom: `1px solid ${LINE}` }}>
          <div
            className="grid items-center gap-8"
            style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 90, gridTemplateColumns: "1fr auto 1fr" }}
          >
            {/* Search */}
            <div
              className="hidden md:flex"
              style={{ alignItems: "center", gap: 10, padding: "12px 16px", background: "#fff", border: `1px solid ${LINE}`, maxWidth: 340, width: "100%", fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".06em", color: "#8c8a82", textTransform: "uppercase" }}
            >
              <Search size={14} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Buscar producto…"
                disabled
                style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontFamily: F_MONO, fontSize: "11px", color: INK, textTransform: "none", letterSpacing: 0, cursor: "not-allowed" }}
              />
            </div>

            {/* Logo */}
            <Link href={`/${slug}`} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", justifyContent: "center" }}>
              {club.logo_url && (
                <img src={club.logo_url} alt={club.nombre} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <span style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 22, letterSpacing: ".02em", color: INK }}>
                {club.nombre}
              </span>
            </Link>

            {/* Social + cart */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
              <div className="hidden md:flex items-center gap-2">
                {[
                  { label: "Instagram", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg> },
                  { label: "Facebook", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                ].map(({ label, svg }) => (
                  <span key={label} title={label} style={{ width: 34, height: 34, display: "grid", placeItems: "center", border: `1px solid ${LINE}`, borderRadius: "50%", color: INK, opacity: 0.28 }}>
                    {svg}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setCartOpen(true)}
                style={{ width: 34, height: 34, display: "grid", placeItems: "center", border: `1px solid ${LINE}`, borderRadius: "50%", background: "none", cursor: "pointer", color: INK, position: "relative" }}
              >
                <ShoppingCart size={16} />
                {itemCount > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: accent, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: INK }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div style={{ borderTop: `1px solid ${LINE}`, padding: "16px 32px", background: PAPER }}>
              <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    style={{ fontFamily: F_MONO, fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: INK, textDecoration: "none", opacity: pathname === href ? 1 : 0.6 }}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </header>

        {/* Nav desktop */}
        <nav className="hidden md:block" style={{ background: PAPER, borderBottom: `1px solid ${LINE}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", gap: 34, height: 52, fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || (href !== `/${slug}` && (pathname ?? "").startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  style={{ position: "relative", padding: "4px 0", color: INK, opacity: active ? 1 : 0.6, textDecoration: "none", transition: "opacity .15s" }}
                >
                  {label}
                  {active && (
                    <span style={{ position: "absolute", left: 0, right: 0, bottom: -15, height: 2, background: accent, display: "block" }} />
                  )}
                </Link>
              );
            })}
            <span style={{ flex: 1 }} />
            <span style={{ opacity: 0.4, fontSize: "10px", letterSpacing: ".18em" }}>
              Temporada · {club.nombre}
            </span>
          </div>
        </nav>
      </div>

      {/* ─── CONTENT ─────────────────────────────── */}
      <main>{children}</main>

      {/* ─── FOOTER ──────────────────────────────── */}
      <footer style={{ background: INK, color: "#bdbcb5", marginTop: 80 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

          {/* Big word */}
          <div
            style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: "clamp(48px, 10vw, 120px)", letterSpacing: "-.03em", lineHeight: 0.85, color: "#141414", padding: "64px 0 24px", textAlign: "center", borderBottom: "1px solid #1f1f1f", userSelect: "none" }}
          >
            {club.nombre.toUpperCase()}
          </div>

          {/* Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10" style={{ padding: "64px 0", borderBottom: "1px solid #1f1f1f" }}>

            {/* Newsletter */}
            <div>
              <h4 style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "#fff", margin: "0 0 16px" }}>Novedades</h4>
              <p style={{ fontSize: "13px", color: "#9c9b94", maxWidth: 280, margin: "0 0 16px", lineHeight: 1.55 }}>
                Suscribite y recibí acceso anticipado a nuevas colecciones y descuentos exclusivos.
              </p>
              <form onSubmit={handleNewsletter} style={{ display: "flex", border: "1px solid #2a2a2a", background: "#0f0f0f" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  style={{ flex: 1, border: "none", background: "transparent", color: "#fff", padding: "12px 14px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
                />
                <button type="submit" style={{ padding: "0 16px", background: accent, color: "#fff", fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 500, border: "none", cursor: "pointer" }}>
                  OK →
                </button>
              </form>
            </div>

            {/* Información */}
            <div>
              <h4 style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "#fff", margin: "0 0 22px" }}>Información</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
                {[{ href: `/${slug}`, label: "Inicio" }, { href: `/${slug}/productos`, label: "Productos" }, { href: `/${slug}/sobre-nosotros`, label: `Sobre ${club.nombre}` }].map(({ href, label }) => (
                  <li key={href}><Link href={href} style={{ fontSize: "13px", color: "#bdbcb5", textDecoration: "none" }} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Ayuda */}
            <div>
              <h4 style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "#fff", margin: "0 0 22px" }}>Ayuda</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
                {[{ href: `/${slug}/devoluciones`, label: "Devoluciones" }, { href: `/${slug}/sobre-nosotros`, label: "Contacto" }].map(({ href, label }) => (
                  <li key={href}><Link href={href} style={{ fontSize: "13px", color: "#bdbcb5", textDecoration: "none" }} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "#fff", margin: "0 0 22px" }}>Legal</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
                {[{ href: `/${slug}/terminos`, label: "Términos y condiciones" }, { href: `/${slug}/privacidad`, label: "Privacidad" }, { href: `/${slug}/devoluciones`, label: "Devoluciones" }].map(({ href, label }) => (
                  <li key={href}><Link href={href} style={{ fontSize: "13px", color: "#bdbcb5", textDecoration: "none" }} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-wrap justify-between items-center gap-3" style={{ padding: "24px 0", fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".1em", color: "#5a5a55" }}>
            <span>© {new Date().getFullYear()} {club.nombre} · Todos los derechos reservados</span>
            <span>Plataforma Clubes Deportivos</span>
            <div style={{ display: "flex", gap: 8 }}>
              {["Visa", "Mastercard", "MercadoPago"].map((m) => (
                <span key={m} style={{ padding: "4px 8px", border: "1px solid #2a2a2a", color: "#9c9b94", fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase" }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <CarritoDrawer open={cartOpen} onOpenChange={setCartOpen} clubSlug={slug} />
    </div>
  );
}
