import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();

  try {
    // Get usuarios_club records for this club
    const { data: usuariosClub, error: ucError } = await supabase
      .from('usuarios_club')
      .select('*')
      .eq('club_id', params.id);

    if (ucError) throw ucError;

    if (!usuariosClub || usuariosClub.length === 0) {
      return NextResponse.json([]);
    }

    // Get all auth users via admin API
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) throw usersError;

    // Merge data
    const merged = usuariosClub.map((uc) => {
      const authUser = users.find((u) => u.id === uc.auth_user_id);
      return {
        ...uc,
        email: authUser?.email || null,
      };
    });

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { auth_user_id, rol } = body;

    if (!auth_user_id || !rol) {
      return NextResponse.json({ error: 'auth_user_id y rol son requeridos' }, { status: 400 });
    }

    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(rol)) {
      return NextResponse.json({ error: 'rol inválido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('usuarios_club')
      .insert({
        club_id: params.id,
        auth_user_id,
        rol,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error adding usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
