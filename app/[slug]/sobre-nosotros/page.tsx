import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TiendaLayout } from "@/components/TiendaLayout";
import type { Club } from "@/types";

interface SobreNosotrosPageProps {
  params: { slug: string };
}

export default async function SobreNosotrosPage({ params }: SobreNosotrosPageProps) {
  const supabase = await createClient();

  const { data: club, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", params.slug)
    .eq("activo", true)
    .single();

  if (error || !club) notFound();

  return (
    <TiendaLayout club={club as Club}>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre {club.nombre}</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p className="text-lg">
            Bienvenido a la tienda oficial de <strong>{club.nombre}</strong>.
            Todos nuestros productos son fabricados bajo demanda con la más alta calidad.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-gray-900 mb-2">Calidad Premium</h3>
              <p className="text-sm text-gray-600">Materiales seleccionados para máxima durabilidad y confort.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🚚</div>
              <h3 className="font-semibold text-gray-900 mb-2">Envío a Domicilio</h3>
              <p className="text-sm text-gray-600">Recibí tu pedido donde estés en 5-7 días hábiles.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">💙</div>
              <h3 className="font-semibold text-gray-900 mb-2">Apoyas al Club</h3>
              <p className="text-sm text-gray-600">Cada compra contribuye directamente al crecimiento del club.</p>
            </div>
          </div>

          <div className="mt-10 p-6 border rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contacto</h2>
            <p className="text-gray-600">
              Para consultas sobre pedidos o productos, podés contactarnos a través de nuestras redes sociales o
              escribirnos directamente.
            </p>
          </div>
        </div>
      </div>
    </TiendaLayout>
  );
}

export async function generateMetadata({ params }: SobreNosotrosPageProps) {
  const supabase = await createClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("nombre")
    .eq("slug", params.slug)
    .single();
  return {
    title: club ? `Sobre Nosotros — ${club.nombre}` : "Sobre Nosotros",
  };
}
