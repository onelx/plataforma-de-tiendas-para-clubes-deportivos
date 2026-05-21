import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TiendaLayout } from "@/components/TiendaLayout";
import Link from "next/link";
import type { Club } from "@/types";

interface DevolucionesPageProps {
  params: { slug: string };
}

export default async function DevolucionesPage({ params }: DevolucionesPageProps) {
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
          Política de Devoluciones
        </h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: enero de 2025</p>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 mb-8">
          <p className="text-sm font-medium text-yellow-800">
            <strong>Importante:</strong> Todos los productos de la tienda de{" "}
            <strong>{club.nombre}</strong> son fabricados bajo demanda especialmente
            para cada pedido. Por este motivo, no aceptamos cambios ni devoluciones
            por arrepentimiento de compra.
          </p>
        </div>

        <div className="space-y-8 text-gray-600">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Cancelaciones</h2>
            <p>
              Si necesitás cancelar tu pedido, podés hacerlo dentro de las{" "}
              <strong>24 horas posteriores</strong> a la confirmación del pago,
              siempre que la producción no haya comenzado. Pasado ese plazo,
              el pedido ya estará en proceso de fabricación y no podrá cancelarse.
            </p>
            <p className="mt-2">
              Para solicitar una cancelación dentro del plazo, contactanos a través
              de los medios indicados en la sección{" "}
              <Link
                href={`/${params.slug}/sobre-nosotros`}
                className="font-medium underline underline-offset-2"
              >
                Sobre Nosotros
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Defectos y errores de fabricación</h2>
            <p className="mb-2">
              Aceptamos reclamos por los siguientes motivos:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Producto con defectos de fabricación visibles</li>
              <li>Producto recibido diferente al que fue pedido (modelo, color, estampado incorrecto)</li>
              <li>Producto dañado durante el envío</li>
            </ul>
            <p className="mt-2">
              En estos casos, reemplazamos el producto sin costo adicional o realizamos
              el reembolso completo, a elección del comprador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cómo hacer un reclamo</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Contactanos dentro de las <strong>72 horas</strong> de recibido el producto
                a través de los medios indicados en{" "}
                <Link
                  href={`/${params.slug}/sobre-nosotros`}
                  className="font-medium underline underline-offset-2"
                >
                  Sobre Nosotros
                </Link>
                .
              </li>
              <li>
                Indicá el número de pedido y describí el problema con detalle.
              </li>
              <li>
                Adjuntá fotografías del producto que muestren claramente el defecto o el error.
              </li>
              <li>
                Nuestro equipo evaluará el caso y te responderá dentro de las{" "}
                <strong>48 horas hábiles</strong>.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cambios de talle</h2>
            <p>
              Dado que los productos son fabricados a medida bajo demanda, <strong>no realizamos
              cambios de talle</strong>. Te recomendamos revisar con cuidado la guía de talles
              antes de realizar tu compra y consultar cualquier duda antes de confirmar el pedido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Reembolsos</h2>
            <p>
              Cuando un reclamo es aceptado y el comprador opta por el reembolso,
              el monto total del pedido es devuelto dentro de los{" "}
              <strong>10 días hábiles</strong> siguientes a la aprobación del reclamo,
              utilizando el mismo medio de pago con el que se realizó la compra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contacto</h2>
            <p>
              Para cualquier consulta sobre esta política, visitá la sección{" "}
              <Link
                href={`/${params.slug}/sobre-nosotros`}
                className="font-medium underline underline-offset-2"
              >
                Sobre Nosotros
              </Link>{" "}
              donde encontrarás nuestros datos de contacto.
            </p>
          </section>

        </div>
      </div>
    </TiendaLayout>
  );
}

export async function generateMetadata({ params }: DevolucionesPageProps) {
  const supabase = await createClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("nombre")
    .eq("slug", params.slug)
    .single();
  return {
    title: club ? `Política de Devoluciones — ${club.nombre}` : "Política de Devoluciones",
  };
}
