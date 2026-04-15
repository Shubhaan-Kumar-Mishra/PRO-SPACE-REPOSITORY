import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useSupabaseTable(table, query = '*') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: result, error: fetchError } = await supabase
        .from(table)
        .select(query)
      
      if (fetchError) throw fetchError
      setData(result || [])
    } catch (err) {
      console.error(`Error fetching from ${table}:`, err.message)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [table, query])

  return { data, loading, error, refresh: fetchData }
}

export async function supabaseInsert(table, payload) {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (err) {
    console.error(`Error inserting into ${table}:`, err.message)
    return { data: null, error: err }
  }
}
