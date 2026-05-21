import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TiendaLayout } from "@/components/TiendaLayout";
import { ProductoCard } from "@/components/ProductoCard";
import type { Club, Producto, VarianteProducto } from "@/types";

interface TiendaPageProps {
  params: { slug: string };
}

type ProductoConVariantes = Producto & { variantes: VarianteProducto[] };

const F_DISPLAY = "var(--font-display, 'Space Grotesk', system-ui, sans-serif)";
const F_MONO = "var(--font-mono, 'Space Mono', ui-monospace, monospace)";
const INK = "#0a0a0a";
const LINE = "#e6e4dd";

export default async function TiendaPage({ params }: TiendaPageProps) {
  const supabase = await createClient();

  const { data: club, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", params.slug)
    .eq("activo", true)
    .single();

  if (error || !club) notFound();

  const { data: rawProductos } = await supabase
    .from("productos")
    .select("*, variantes:variantes_producto(*)")
    .eq("club_id", club.id)
    .eq("activo", true)
    .order("created_at", { ascending: false });

  const productos: ProductoConVariantes[] = (rawProductos ?? []) as ProductoConVariantes[];
  const slug = params.slug;
  const accent = club.color_primario || "#FF4D1F";

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  // Derived
  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))] as string[];
  const heroImagen = productos[0]?.imagenes?.[0] ?? club.logo_url ?? null;

  // Split club name for the hero heading: last word gets accent
  const nameParts = club.nombre.trim().split(" ");
  const nameHead = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
  const nameTail = nameParts[nameParts.length - 1];

  return (
    <TiendaLayout club={club as Club}>

      {/* ─── HERO ────────────────────────────────── */}
      <section style={{ padding: "32px 0 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: 480, background: INK, overflow: "hidden" }}>

            {/* Copy */}
            <div style={{ padding: "clamp(32px,5vw,56px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 32, color: "#fafaf7", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>
                  <span style={{ width: 34, height: 1, background: accent, display: "inline-block" }} />
                  {club.nombre} · Tienda Oficial
                </div>
                <h1 style={{ fontFamily: F_DISPLAY, fontWeight: 500, fontSize: "clamp(52px,7vw,108px)", lineHeight: 0.9, letterSpacing: "-.03em", margin: 0, color: "#fafaf7" }}>
                  {nameHead && <>{nameHead}<br /></>}
                  <em style={{ fontStyle: "normal", color: accent }}>{nameTail}</em>
                </h1>
                <p style={{ fontFamily: F_MONO, fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
                  Equipamiento y merchandising oficial · Fabricado bajo demanda
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                <Link
                  href={`/${slug}/productos`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "18px 28px", background: accent, color: "#fff", fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none" }}
                >
                  Ver la colección
                  <ArrowRight size={14} />
                </Link>
                <div style={{ fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", lineHeight: 2, textAlign: "right" }}>
                  {productos.length} producto{productos.length !== 1 ? "s" : ""}<br />
                  Disponible ahora
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div className="hidden md:block" style={{ position: "relative", background: "#171717", minHeight: 400 }}>
              {heroImagen ? (
                <img src={heroImagen} alt={club.nombre} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,.18)", fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase" }}>
                  <div style={{ position: "absolute", inset: 24, border: "1px dashed rgba(255,255,255,.12)" }} />
                  <span style={{ position: "relative", padding: "6px 12px", background: "#171717" }}>Imagen · {club.nombre}</span>
                </div>
              )}
              {/* Dots decorativos */}
              <div style={{ position: "absolute", right: 32, bottom: 24, display: "flex", gap: 8, zIndex: 3 }}>
                {[true, false, false, false].map((on, i) => (
                  <span key={i} style={{ width: 24, height: 2, background: on ? accent : "rgba(255,255,255,.2)", display: "block" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROMO TILES ─────────────────────────── */}
      <section style={{ padding: "8px 0 56px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>

            {/* Tile 1 — claro */}
            <div style={{ position: "relative", minHeight: 200, background: "#eeece5", overflow: "hidden", display: "flex", alignItems: "center", padding: "0 40px", gap: 24, color: INK }}>
              <div style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 48, lineHeight: 0.95, letterSpacing: "-.02em", flexShrink: 0, width: 180 }}>
                <em style={{ fontStyle: "normal", color: accent }}>{productos[0] ? "Nuevo" : "Pronto"}</em>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <span style={{ fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.55 }}>Colección actual · {club.nombre}</span>
                <h3 style={{ fontWeight: 500, fontSize: 18, letterSpacing: "-.01em", margin: 0, lineHeight: 1.3 }}>
                  {productos[0] ? <><strong>{productos[0].nombre}</strong> — producto destacado</> : `Colección de ${club.nombre}`}
                </h3>
                {productos[0] && (
                  <div style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", marginTop: 4, opacity: 0.7 }}>
                    desde {fmt(productos[0].precio_base)}
                  </div>
                )}
              </div>
              <Link href={`/${slug}/productos`} style={{ position: "absolute", right: 24, top: 24, width: 44, height: 44, border: "1px solid currentColor", borderRadius: "50%", display: "grid", placeItems: "center", opacity: 0.45, color: INK }} className="hover:opacity-100 transition-opacity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
              </Link>
            </div>

            {/* Tile 2 — oscuro */}
            <div style={{ position: "relative", minHeight: 200, background: INK, overflow: "hidden", display: "flex", alignItems: "center", padding: "0 40px", gap: 24, color: "#fafaf7" }}>
              <div style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 48, lineHeight: 0.95, letterSpacing: "-.02em", flexShrink: 0, width: 180 }}>
                <em style={{ fontStyle: "normal", color: accent }}>100%</em><br />club
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <span style={{ fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.55 }}>Producción · Bajo demanda</span>
                <h3 style={{ fontWeight: 500, fontSize: 18, letterSpacing: "-.01em", margin: 0, lineHeight: 1.3 }}>
                  <strong>Fabricado especialmente</strong><br />para cada pedido
                </h3>
                <div style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", marginTop: 4, opacity: 0.7 }}>
                  5-10 días hábiles
                </div>
              </div>
              <Link href={`/${slug}/sobre-nosotros`} style={{ position: "absolute", right: 24, top: 24, width: 44, height: 44, border: "1px solid currentColor", borderRadius: "50%", display: "grid", placeItems: "center", opacity: 0.45, color: "#fafaf7" }} className="hover:opacity-100 transition-opacity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTOS (bestsellers) ──────────────── */}
      <section style={{ paddingBottom: 24 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "64px 0 36px", borderBottom: `1px solid ${LINE}`, marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "#8c8a82" }}>
                <span style={{ width: 28, height: 1, background: INK, display: "inline-block" }} />
                Lo más reciente del club
              </div>
              <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 500, fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-.025em", lineHeight: 1, margin: 0 }}>
                <em style={{ fontStyle: "normal", color: accent }}>Productos</em>
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
              <span style={{ color: "#8c8a82" }}>{productos.length} producto{productos.length !== 1 ? "s" : ""}</span>
              <Link href={`/${slug}/productos`} style={{ color: INK, textDecoration: "none", opacity: 0.7 }} className="hover:opacity-100 transition-opacity">Ver todos →</Link>
            </div>
          </div>

          {productos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 24 }}>
              {productos.slice(0, 4).map((p, i) => (
                <ProductoCard key={p.id} producto={p} clubSlug={slug} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", background: "#f3f2ee" }}>
              <p style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "#8c8a82" }}>
                Próximamente nuevos productos
              </p>
            </div>
          )}

          {productos.length > 4 && (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0 0" }}>
              <Link
                href={`/${slug}/productos`}
                style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "18px 32px", border: `1px solid ${INK}`, background: "transparent", color: INK, fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none" }}
                className="hover:bg-[#0a0a0a] hover:text-white transition-colors"
              >
                Ver más productos
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── CATEGORIES STRIP ────────────────────── */}
      {categorias.length > 0 && (
        <section style={{ padding: "80px 0 0", borderTop: `1px solid ${LINE}`, marginTop: 80 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "#8c8a82", marginBottom: 10 }}>
                  <span style={{ width: 28, height: 1, background: INK, display: "inline-block" }} />
                  Explorar por categoría
                </div>
                <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 500, fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-.025em", lineHeight: 1, margin: 0 }}>
                  Casa de <em style={{ fontStyle: "normal", color: accent }}>colecciones</em>
                </h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(categorias.length + 1, 6)}, 1fr)`, border: `1px solid ${LINE}` }}>
              {categorias.slice(0, 5).map((cat, i) => (
                <Link
                  key={cat}
                  href={`/${slug}/productos?categoria=${encodeURIComponent(cat)}`}
                  style={{ height: 96, display: "grid", placeItems: "center", borderRight: `1px solid ${LINE}`, fontFamily: F_DISPLAY, fontWeight: 600, fontSize: 18, letterSpacing: ".02em", color: "#8c8a82", textDecoration: "none", position: "relative" }}
                  className="hover:text-[#0a0a0a] hover:bg-white transition-colors"
                >
                  {cat}
                  <span style={{ position: "absolute", top: 10, right: 10, fontFamily: F_MONO, fontSize: "8px", letterSpacing: ".14em", color: "#a1a098" }}>
                    0{i + 1}
                  </span>
                </Link>
              ))}
              <Link
                href={`/${slug}/productos`}
                style={{ height: 96, display: "grid", placeItems: "center", fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", background: "#f3f2ee", color: "#8c8a82", textDecoration: "none" }}
                className="hover:text-[#0a0a0a] transition-colors"
              >
                Ver todos →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── COLLECTIONS BENTO ───────────────────── */}
      {categorias.length >= 3 && (
        <section>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "64px 0 36px", borderBottom: `1px solid ${LINE}`, marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "#8c8a82" }}>
                  <span style={{ width: 28, height: 1, background: INK, display: "inline-block" }} />
                  Comprar por categoría
                </div>
                <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 500, fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-.025em", lineHeight: 1, margin: 0 }}>
                  <em style={{ fontStyle: "normal", color: accent }}>Colecciones</em>
                </h2>
              </div>
              <Link href={`/${slug}/productos`} style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: INK, textDecoration: "none", opacity: 0.7 }}>
                Catálogo completo →
              </Link>
            </div>

            <div
              className="hidden md:grid"
              style={{ gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 20, height: 540 }}
            >
              {/* Celda tall */}
              <Link
                href={`/${slug}/productos?categoria=${encodeURIComponent(categorias[0])}`}
                style={{ gridRow: "span 2", background: INK, color: "#fafaf7", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 28, textDecoration: "none" }}
                className="group"
              >
                <div style={{ position: "absolute", inset: 14, border: "1px dashed rgba(255,255,255,.1)", pointerEvents: "none" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.6, position: "relative", zIndex: 2 }}>
                  <span>01 / {categorias[0]}</span>
                  <span>{productos.filter((p) => p.categoria === categorias[0]).length} productos</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: F_DISPLAY, fontWeight: 500, fontSize: "clamp(56px,6vw,88px)", lineHeight: 0.95, letterSpacing: "-.02em", margin: "0 0 20px", position: "relative", zIndex: 2 }}>
                    {categorias[0]}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", position: "relative", zIndex: 2 }}>
                    <span style={{ opacity: 0.5 }}>Ver todo →</span>
                    <span style={{ width: 36, height: 36, border: "1px solid currentColor", borderRadius: "50%", display: "grid", placeItems: "center", opacity: 0.5 }} className="group-hover:opacity-100 transition-opacity">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
                    </span>
                  </div>
                </div>
              </Link>

              {/* Celdas regulares */}
              {categorias.slice(1, 5).map((cat, i) => (
                <Link
                  key={cat}
                  href={`/${slug}/productos?categoria=${encodeURIComponent(cat)}`}
                  style={{ background: "#eeece5", color: INK, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 28, textDecoration: "none" }}
                  className="group"
                >
                  <div style={{ position: "absolute", inset: 14, border: "1px dashed rgba(0,0,0,.08)", pointerEvents: "none" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.6, position: "relative", zIndex: 2 }}>
                    <span>0{i + 2} / {cat}</span>
                    <span>{productos.filter((p) => p.categoria === cat).length}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 2 }}>
                    <h3 style={{ fontFamily: F_DISPLAY, fontWeight: 500, fontSize: 48, lineHeight: 0.95, letterSpacing: "-.02em", margin: 0 }}>
                      {cat}
                    </h3>
                    <span style={{ width: 36, height: 36, border: "1px solid currentColor", borderRadius: "50%", display: "grid", placeItems: "center", opacity: 0.5 }} className="group-hover:opacity-100 transition-opacity">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── GALERÍA ─────────────────────────────── */}
      <section style={{ paddingTop: 120 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 0 36px", borderBottom: `1px solid ${LINE}`, marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "#8c8a82" }}>
                <span style={{ width: 28, height: 1, background: INK, display: "inline-block" }} />
                La colección · {club.nombre}
              </div>
              <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 500, fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-.025em", lineHeight: 1, margin: 0 }}>
                <em style={{ fontStyle: "normal", color: accent }}>Galería</em>
              </h2>
            </div>
            <Link href={`/${slug}/productos`} style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: INK, textDecoration: "none", opacity: 0.7 }}>
              Ver catálogo completo →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6" style={{ gap: 6 }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const p = productos[i];
              const img = p?.imagenes?.[0];
              return (
                <Link
                  key={i}
                  href={p ? `/${slug}/producto/${p.id}` : `/${slug}/productos`}
                  style={{ aspectRatio: "1/1", background: "#eeece5", position: "relative", overflow: "hidden", display: "grid", placeItems: "center", textDecoration: "none" }}
                  className="group"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={p!.nombre}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }}
                      className="group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div style={{ position: "absolute", inset: 12, border: "1px dashed rgba(0,0,0,.08)" }} />
                      <span style={{ position: "relative", fontFamily: F_MONO, fontSize: "9px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(0,0,0,.32)" }}>
                        Foto · 0{i + 1}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </TiendaLayout>
  );
}

export async function generateMetadata({ params }: TiendaPageProps) {
  const supabase = await createClient();
  const { data: club } = await supabase.from("clubs").select("nombre").eq("slug", params.slug).single();
  return {
    title: club ? `Tienda ${club.nombre}` : "Tienda",
    description: club ? `Tienda oficial de ${club.nombre}. Equipamiento y merchandising exclusivo.` : "",
  };
}
