import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TiendaLayout } from "@/components/TiendaLayout";
import type { Club } from "@/types";

interface PrivacidadPageProps {
  params: { slug: string };
}

export default async function PrivacidadPage({ params }: PrivacidadPageProps) {
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
          Política de Privacidad
        </h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: enero de 2025</p>

        <div className="space-y-8 text-gray-600">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Información que recopilamos</h2>
            <p className="mb-2">
              Al realizar una compra en la tienda de <strong>{club.nombre}</strong>,
              recopilamos la siguiente información personal:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nombre y apellido</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección de envío (calle, ciudad, provincia, código postal)</li>
            </ul>
            <p className="mt-2">
              No almacenamos datos de tarjetas de crédito ni información bancaria.
              Los pagos son procesados por plataformas de pago seguras y certificadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Uso de la información</h2>
            <p className="mb-2">Los datos recopilados se utilizan exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Procesar y entregar tu pedido</li>
              <li>Comunicarte el estado de tu compra</li>
              <li>Resolver consultas o reclamos relacionados con tu pedido</li>
              <li>Cumplir con obligaciones legales y fiscales</li>
            </ul>
            <p className="mt-2">
              No vendemos, alquilamos ni compartimos tu información personal con terceros
              para fines comerciales propios de esas terceras partes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Almacenamiento y seguridad</h2>
            <p>
              Tu información es almacenada en servidores seguros con cifrado de datos.
              Aplicamos medidas técnicas y organizativas para proteger tus datos personales
              frente a accesos no autorizados, pérdida o alteración.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
            <p>
              Este sitio puede utilizar cookies técnicas necesarias para su funcionamiento
              (como el carrito de compras). No utilizamos cookies de rastreo publicitario
              de terceros sin tu consentimiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Tus derechos</h2>
            <p className="mb-2">
              De acuerdo con la Ley N° 25.326 de Protección de Datos Personales (Argentina),
              tenés derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acceder a los datos personales que tenemos sobre vos</li>
              <li>Solicitar la rectificación de datos incorrectos</li>
              <li>Solicitar la eliminación de tus datos personales</li>
              <li>Oponerte al tratamiento de tus datos en determinadas circunstancias</li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, contactanos a través de los medios indicados
              en la sección "Sobre Nosotros".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Modificaciones a esta política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente.
              Te notificaremos sobre cambios significativos publicando la nueva versión
              en esta página con la fecha de actualización correspondiente.
            </p>
          </section>

        </div>
      </div>
    </TiendaLayout>
  );
}

export async function generateMetadata({ params }: PrivacidadPageProps) {
  const supabase = await createClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("nombre")
    .eq("slug", params.slug)
    .single();
  return {
    title: club ? `Política de Privacidad — ${club.nombre}` : "Política de Privacidad",
  };
}
