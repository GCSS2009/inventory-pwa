import { useState } from "react";
import { supabase } from "../App";
export function useSupabaseTable(table) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    async function load(selectString = "*") {
        setLoading(true);
        setError(null);
        const { data: rows, error } = await supabase
            .from(table)
            .select(selectString);
        if (error)
            setError(error.message);
        else
            setData(rows);
        setLoading(false);
    }
    return { data, error, loading, load };
}
