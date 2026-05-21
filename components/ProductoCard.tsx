"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Producto, VarianteProducto } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";

const COLOR_MAP: Record<string, string> = {
  negro: "#0a0a0a",
  blanco: "#f5f5f0",
  rojo: "#dc2626",
  azul: "#1d4ed8",
  "azul marino": "#1e3a5f",
  "azul rey": "#2563eb",
  celeste: "#38bdf8",
  verde: "#16a34a",
  amarillo: "#fbbf24",
  naranja: "#f97316",
  gris: "#6b7280",
  "gris claro": "#d1d5db",
  violeta: "#7c3aed",
  rosa: "#ec4899",
  bordo: "#881337",
  beige: "#d4b896",
  marron: "#92400e",
};

function colorToHex(color: string | null): string | null {
  if (!color) return null;
  return COLOR_MAP[color.toLowerCase().trim()] ?? null;
}

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
}

interface ProductoCardProps {
  producto: Producto & { variantes?: VarianteProducto[] };
  clubSlug: string;
  index?: number;
}

export function ProductoCard({ producto, clubSlug, index = 0 }: ProductoCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const variantes = producto.variantes ?? [];
  const variantesActivas = variantes.filter((v) => v.activo);
  const hasVariants = variantesActivas.length > 1;
  const coloresUnicos = [...new Set(variantesActivas.map((v) => v.color).filter(Boolean))] as string[];
  const imagen = producto.imagenes?.[0];
  const nuevo = isNew(producto.created_at);
  const sku = `${clubSlug.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`;

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants) {
      router.push(`/${clubSlug}/producto/${producto.id}`);
      return;
    }
    addItem(producto, variantesActivas[0] ?? null, 1);
    toast({ title: `${producto.nombre} agregado al carrito` });
  };

  return (
    <Link
      href={`/${clubSlug}/producto/${producto.id}`}
      className="group"
      style={{ display: "flex", flexDirection: "column", gap: "14px", textDecoration: "none", color: "inherit" }}
    >
      {/* Media */}
      <div style={{ position: "relative", aspectRatio: "4/5", background: "#eeece5", overflow: "hidden", display: "grid", placeItems: "center" }}>
        {/* Dashed inner border */}
        <div style={{ position: "absolute", inset: 16, border: "1px dashed rgba(0,0,0,.1)", pointerEvents: "none", zIndex: 1 }} />

        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }}
            className="group-hover:scale-105"
          />
        ) : (
          <span style={{ position: "relative", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(0,0,0,.32)", padding: "6px 12px", background: "#eeece5" }}>
            {producto.nombre}
          </span>
        )}

        {/* Badge */}
        {nuevo && (
          <div style={{ position: "absolute", top: 12, left: 12, fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: ".18em", textTransform: "uppercase", padding: "5px 9px", background: "var(--accent, #FF4D1F)", color: "#fff", zIndex: 2 }}>
            Nuevo
          </div>
        )}

        {/* Quick add overlay */}
        <button
          onClick={handleQuickAdd}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ position: "absolute", bottom: 12, left: 12, right: 12, padding: "11px", background: "rgba(10,10,10,.92)", color: "#fafaf7", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", textAlign: "center", border: "none", cursor: "pointer", zIndex: 3 }}
        >
          {hasVariants ? "Elegir talle →" : "+ Agregar rápido"}
        </button>
      </div>

      {/* SKU */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: "#8c8a82", display: "flex", justifyContent: "space-between" }}>
        <span>{sku}</span>
        {variantesActivas.length > 0 && <span>{variantesActivas.length} var.</span>}
      </div>

      {/* Nombre */}
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "18px", letterSpacing: "-.01em", lineHeight: 1.25, margin: 0 }}>
        {producto.nombre}
      </h3>

      {/* Precio + swatches */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginTop: 2 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 500, letterSpacing: ".02em" }}>
          {fmt(producto.precio_base)}
        </div>
        {coloresUnicos.length > 0 && (
          <div style={{ display: "flex", gap: "5px" }}>
            {coloresUnicos.slice(0, 5).map((color) => {
              const hex = colorToHex(color);
              return (
                <span
                  key={color}
                  title={color}
                  style={{ width: 11, height: 11, borderRadius: "50%", display: "block", background: hex ?? "#ccc", border: "1px solid rgba(0,0,0,.12)" }}
                />
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
