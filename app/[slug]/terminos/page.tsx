import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TiendaLayout } from "@/components/TiendaLayout";
import type { Club } from "@/types";

interface TerminosPageProps {
  params: { slug: string };
}

export default async function TerminosPage({ params }: TerminosPageProps) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Términos y Condiciones
        </h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: enero de 2025</p>

        <div className="space-y-8 text-gray-600">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceptación de los términos</h2>
            <p>
              Al acceder y realizar compras en la tienda oficial de <strong>{club.nombre}</strong>,
              el usuario acepta los presentes Términos y Condiciones en su totalidad.
              Si no está de acuerdo con alguna de estas condiciones, le pedimos que se abstenga de utilizar este sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Productos y disponibilidad</h2>
            <p>
              Todos los productos ofrecidos en esta tienda son fabricados bajo demanda.
              Las imágenes son de carácter ilustrativo. Nos reservamos el derecho de modificar
              los precios, descripciones y disponibilidad de los productos sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Proceso de compra</h2>
            <p className="mb-2">
              Al realizar un pedido, el usuario confirma que la información proporcionada
              (nombre, dirección, contacto) es verídica y completa. El pedido queda confirmado
              una vez procesado el pago correspondiente.
            </p>
            <p>
              Los precios están expresados en pesos argentinos (ARS) e incluyen los impuestos
              aplicables según la legislación vigente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Producción y tiempos de entrega</h2>
            <p>
              Dado que los productos son fabricados bajo demanda, los tiempos de producción
              son de <strong>5 a 10 días hábiles</strong> desde la confirmación del pago.
              A ese plazo se suma el tiempo de envío según la zona de destino.
              Los plazos son estimativos y pueden variar por causas ajenas a nuestra voluntad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cancelaciones</h2>
            <p>
              El usuario puede solicitar la cancelación de su pedido dentro de las <strong>24 horas</strong>
              {" "}posteriores a la confirmación del pago, siempre que el proceso de producción
              no haya comenzado. Para solicitar una cancelación, contactarse por los medios
              indicados en la sección "Sobre Nosotros".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Responsabilidad</h2>
            <p>
              {club.nombre} no será responsable por daños indirectos, pérdidas de ganancias
              ni situaciones derivadas del uso o la imposibilidad de uso de los productos adquiridos.
              Nuestra responsabilidad máxima se limita al valor del pedido en cuestión.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Modificaciones</h2>
            <p>
              Estos Términos y Condiciones pueden ser modificados en cualquier momento.
              Los cambios entran en vigencia desde su publicación en este sitio.
              Recomendamos revisar esta sección periódicamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Legislación aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República Argentina.
              Cualquier controversia será sometida a la jurisdicción de los tribunales ordinarios
              competentes de la Ciudad Autónoma de Buenos Aires.
            </p>
          </section>

        </div>
      </div>
    </TiendaLayout>
  );
}

export async function generateMetadata({ params }: TerminosPageProps) {
  const supabase = await createClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("nombre")
    .eq("slug", params.slug)
    .single();
  return {
    title: club ? `Términos y Condiciones — ${club.nombre}` : "Términos y Condiciones",
  };
}
