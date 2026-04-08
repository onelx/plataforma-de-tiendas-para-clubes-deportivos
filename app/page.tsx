import Link from 'next/link'
import { ArrowRight, Store, TrendingUp, Package, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Landing page principal de la plataforma
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">ClubShop</h1>
          <nav className="flex items-center gap-4">
            <Link href="/club/login" className="text-gray-600 hover:text-gray-900">
              Acceso Clubes
            </Link>
            <Link href="/tienda/demo">
              <Button>Ver Demo</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Tu club, tu tienda online
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Crea una tienda personalizada para tu club deportivo. 
            Nosotros nos encargamos de fabricar y enviar los productos.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/club/registro">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Empezar gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/tienda/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Ver tienda de ejemplo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegir ClubShop?
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Store className="w-8 h-8" />}
              title="Tu marca, tu estilo"
              description="Personaliza los colores, logo y productos de tu tienda para que refleje la identidad de tu club."
            />
            <FeatureCard
              icon={<Package className="w-8 h-8" />}
              title="Sin inventario"
              description="Fabricamos bajo demanda. No necesitas comprar stock ni almacenar productos."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Gana comisiones"
              description="Recibe un porcentaje de cada venta. Cuanto más vendas, más gana tu club."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Sin riesgo"
              description="Empezar es gratis. Solo pagas cuando vendes. Sin compromisos."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            ¿Listo para empezar?
          </h3>
          <p className="text-gray-400 mb-8">
            Crea tu tienda en minutos. Sin costes iniciales.
          </p>
          <Link href="/club/registro">
            <Button size="lg">
              Registrar mi club
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ClubShop Platform. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
