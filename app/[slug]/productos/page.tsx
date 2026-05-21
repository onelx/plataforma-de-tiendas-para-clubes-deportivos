import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TiendaLayout } from "@/components/TiendaLayout";
import { ProductoCard } from "@/components/ProductoCard";
import type { Club, Producto, VarianteProducto } from "@/types";

interface ProductosPageProps {
  params: { slug: string };
  searchParams?: { categoria?: string };
}

type ProductoConVariantes = Producto & { variantes: VarianteProducto[] };

const F_DISPLAY = "var(--font-display, 'Space Grotesk', system-ui, sans-serif)";
const F_MONO = "var(--font-mono, 'Space Mono', ui-monospace, monospace)";
const INK = "#0a0a0a";
const LINE = "#e6e4dd";

export default async function ProductosPage({ params, searchParams }: ProductosPageProps) {
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

  const todos: ProductoConVariantes[] = (rawProductos ?? []) as ProductoConVariantes[];
  const categorias = [...new Set(todos.map((p) => p.categoria).filter(Boolean))] as string[];
  const filtroActivo = searchParams?.categoria ?? null;
  const productos = filtroActivo ? todos.filter((p) => p.categoria === filtroActivo) : todos;
  const accent = club.color_primario || "#FF4D1F";

  return (
    <TiendaLayout club={club as Club}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "64px 0 36px", borderBottom: `1px solid ${LINE}`, marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "#8c8a82" }}>
              <span style={{ width: 28, height: 1, background: INK, display: "inline-block" }} />
              {filtroActivo ? `Categoría · ${filtroActivo}` : "Todo el catálogo"}
            </div>
            <h1 style={{ fontFamily: F_DISPLAY, fontWeight: 500, fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-.025em", lineHeight: 1, margin: 0 }}>
              {filtroActivo
                ? <em style={{ fontStyle: "normal", color: accent }}>{filtroActivo}</em>
                : <><em style={{ fontStyle: "normal", color: accent }}>Todos</em> los productos</>
              }
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase" }}>
            <span style={{ color: "#8c8a82" }}>{productos.length} producto{productos.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Filtros de categoría */}
        {categorias.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            <a
              href={`/${params.slug}/productos`}
              style={{ padding: "8px 16px", border: `1px solid ${filtroActivo ? LINE : INK}`, background: filtroActivo ? "transparent" : INK, color: filtroActivo ? "#8c8a82" : "#fafaf7", fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none", transition: "all .15s" }}
            >
              Todos
            </a>
            {categorias.map((cat) => (
              <a
                key={cat}
                href={`/${params.slug}/productos?categoria=${encodeURIComponent(cat)}`}
                style={{ padding: "8px 16px", border: `1px solid ${filtroActivo === cat ? INK : LINE}`, background: filtroActivo === cat ? INK : "transparent", color: filtroActivo === cat ? "#fafaf7" : "#8c8a82", fontFamily: F_MONO, fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none", transition: "all .15s" }}
              >
                {cat}
              </a>
            ))}
          </div>
        )}

        {/* Grid */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 24, paddingBottom: 80 }}>
            {productos.map((p, i) => (
              <ProductoCard key={p.id} producto={p} clubSlug={params.slug} index={i} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0 120px" }}>
            <p style={{ fontFamily: F_MONO, fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "#8c8a82" }}>
              No hay productos en esta categoría todavía
            </p>
          </div>
        )}
      </div>
    </TiendaLayout>
  );
}

export async function generateMetadata({ params }: ProductosPageProps) {
  const supabase = await createClient();
  const { data: club } = await supabase.from("clubs").select("nombre").eq("slug", params.slug).single();
  return {
    title: club ? `Productos — ${club.nombre}` : "Productos",
  };
}
