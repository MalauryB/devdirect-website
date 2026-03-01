"use client"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Update the profiles table with avatar_url
// This is needed because auth.users and profiles are separate tables
export async function updateProfileAvatarUrl(userId: string, avatarUrl: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  return { error }
}
