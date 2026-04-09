import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TiendaLayout } from "@/components/TiendaLayout";
import { ProductoCard } from "@/components/ProductoCard";
import type { Club, Producto } from "@/types";

interface ProductosPageProps {
  params: { slug: string };
}

export default async function ProductosPage({ params }: ProductosPageProps) {
  const supabase = await createClient();

  const { data: club, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", params.slug)
    .eq("activo", true)
    .single();

  if (error || !club) notFound();

  const { data: productos } = await supabase
    .from("productos")
    .select("*, variantes:variantes_producto(*)")
    .eq("club_id", club.id)
    .eq("activo", true)
    .order("created_at", { ascending: false });

  return (
    <TiendaLayout club={club as Club}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos</h1>
        <p className="text-gray-500 mb-8">Todo el catálogo de {club.nombre}</p>

        {productos && productos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto as Producto}
                clubSlug={params.slug}
                clubPrimaryColor={club.color_primario}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <p className="text-gray-500">Próximamente nuevos productos disponibles</p>
          </div>
        )}
      </div>
    </TiendaLayout>
  );
}

export async function generateMetadata({ params }: ProductosPageProps) {
  const supabase = await createClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("nombre")
    .eq("slug", params.slug)
    .single();
  return {
    title: club ? `Productos — ${club.nombre}` : "Productos",
  };
}
