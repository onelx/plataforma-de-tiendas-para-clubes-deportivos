import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import TiendaLayout from '@/components/TiendaLayout';
import ProductoCard from '@/components/ProductoCard';
import { Club, Producto } from '@/types';

async function getClub(slug: string): Promise<Club | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/clubs/${slug}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching club:', error);
    return null;
  }
}

async function getProductos(slug: string): Promise<Producto[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/clubs/${slug}/productos`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching productos:', error);
    return [];
  }
}

function ProductosGrid({ productos }: { productos: Producto[] }) {
  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay productos disponibles
        </h3>
        <p className="text-gray-600">
          Pronto habrá nuevos productos en esta tienda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productos.map((producto) => (
        <ProductoCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default async function TiendaPage({ 
  params 
}: { 
  params: { club: string } 
}) {
  const club = await getClub(params.club);
  
  if (!club || !club.activo) {
    notFound();
  }

  const productos = await getProductos(params.club);

  return (
    <TiendaLayout club={club}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tienda Oficial {club.nombre}
          </h1>
          <p className="text-gray-600">
            Productos oficiales fabricados bajo demanda
          </p>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80" />
            ))}
          </div>
        }>
          <ProductosGrid productos={productos} />
        </Suspense>
      </div>
    </TiendaLayout>
  );
}
