"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Club } from "@/types";

// Hook para obtener datos del club actual
export function useClub(slug: string) {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClub() {
      try {
        const supabase = createClient();
        
        const { data, error: fetchError } = await supabase
          .from("clubs")
          .select("*")
          .eq("slug", slug)
          .eq("activo", true)
          .single();

        if (fetchError) {
          throw new Error("Club no encontrado");
        }

        setClub(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchClub();
    }
  }, [slug]);

  return { club, loading, error };
}
