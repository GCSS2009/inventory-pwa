import { useState } from "react";
import { supabase } from "../App";

export function useSupabaseTable<T>(table: string) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(selectString = "*") {
    setLoading(true);
    setError(null);

    const { data: rows, error } = await supabase
      .from(table)
      .select(selectString);

    if (error) setError(error.message);
    else setData(rows as T[]);

    setLoading(false);
  }

  return { data, error, loading, load };
}
