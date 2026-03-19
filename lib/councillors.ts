/**
 * councillors.ts
 * ──────────────
 * Helper functions for querying the `councillors` table in Supabase.
 * All 9,473 elected councillors from the 2021 SA Local Government Elections
 * are stored in this table — no hardcoding needed.
 *
 * Usage:
 *   import { searchCouncillors, getCouncillorsByMunicipality } from '@/lib/councillors'
 */

import { supabase } from './supabase' // adjust path to your supabase client

export type Councillor = {
  id: string
  province: string
  municipality: string
  party: string
  ward_list_order: string
  seat_category: 'Ward' | 'PR' | 'DC 40%'
  surname: string
  full_name: string
  seat_type: string
  created_at: string
}

// ── Fetch all councillors for a specific municipality ──────────────────────
export async function getCouncillorsByMunicipality(municipality: string): Promise<Councillor[]> {
  const { data, error } = await supabase
    .from('councillors')
    .select('*')
    .ilike('municipality', `%${municipality}%`)
    .order('surname', { ascending: true })

  if (error) throw error
  return data as Councillor[]
}

// ── Fetch all councillors for a province ──────────────────────────────────
export async function getCouncillorsByProvince(province: string): Promise<Councillor[]> {
  const { data, error } = await supabase
    .from('councillors')
    .select('*')
    .eq('province', province)
    .order('municipality', { ascending: true })

  if (error) throw error
  return data as Councillor[]
}

// ── Full-text search by name or surname ───────────────────────────────────
export async function searchCouncillors(query: string): Promise<Councillor[]> {
  const { data, error } = await supabase
    .from('councillors')
    .select('*')
    .or(`full_name.ilike.%${query}%,surname.ilike.%${query}%`)
    .order('surname', { ascending: true })
    .limit(50)

  if (error) throw error
  return data as Councillor[]
}

// ── Filter by party ────────────────────────────────────────────────────────
export async function getCouncillorsByParty(party: string): Promise<Councillor[]> {
  const { data, error } = await supabase
    .from('councillors')
    .select('*')
    .ilike('party', `%${party}%`)
    .order('province', { ascending: true })

  if (error) throw error
  return data as Councillor[]
}

// ── Get distinct list of all municipalities (for dropdowns/search) ─────────
export async function getAllMunicipalities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('councillors')
    .select('municipality')
    .order('municipality', { ascending: true })

  if (error) throw error
  // Deduplicate
  const unique = [...new Set((data as { municipality: string }[]).map(r => r.municipality))]
  return unique
}

// ── Get distinct list of all provinces ────────────────────────────────────
export async function getAllProvinces(): Promise<string[]> {
  const { data, error } = await supabase
    .from('councillors')
    .select('province')
    .order('province', { ascending: true })

  if (error) throw error
  const unique = [...new Set((data as { province: string }[]).map(r => r.province))]
  return unique
}

// ── Combined filter (province + municipality + party + seat category) ──────
export async function filterCouncillors(filters: {
  province?: string
  municipality?: string
  party?: string
  seat_category?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ data: Councillor[]; count: number }> {
  let query = supabase
    .from('councillors')
    .select('*', { count: 'exact' })

  if (filters.province)      query = query.eq('province', filters.province)
  if (filters.municipality)  query = query.ilike('municipality', `%${filters.municipality}%`)
  if (filters.party)         query = query.ilike('party', `%${filters.party}%`)
  if (filters.seat_category) query = query.eq('seat_category', filters.seat_category)
  if (filters.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,surname.ilike.%${filters.search}%`
    )
  }

  query = query
    .order('province', { ascending: true })
    .order('municipality', { ascending: true })
    .order('surname', { ascending: true })
    .range(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 50) - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { data: data as Councillor[], count: count ?? 0 }
}
