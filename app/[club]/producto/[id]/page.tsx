import { notFound } from 'next/navigation';
import TiendaLayout from '@/components/TiendaLayout';
import ProductoDetalle from '@/components/ProductoDetalle';
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

async function getProducto(id: string): Promise<Producto | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/productos/${id}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching producto:', error);
    return null;
  }
}

export default async function ProductoPage({ 
  params 
}: { 
  params: { club: string; id: string } 
}) {
  const [club, producto] = await Promise.all([
    getClub(params.club),
    getProducto(params.id)
  ]);

  if (!club || !club.activo || !producto || !producto.activo) {
    notFound();
  }

  if (producto.club_id !== club.id) {
    notFound();
  }

  return (
    <TiendaLayout club={club}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductoDetalle producto={producto} clubSlug={params.club} />
      </div>
    </TiendaLayout>
  );
}
