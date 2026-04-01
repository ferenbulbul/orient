import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Yeni kullanıcı oluşturur (Edge Function olmadan).
 * Ayrı bir client kullanarak admin'in session'ını bozmaz.
 * @returns {{ userId: string }} oluşturulan kullanıcının ID'si
 */
export async function createNewUser({ email, password, full_name, company_name, phone, role = 'musteri' }) {
  // Session'sız ayrı client — admin'in oturumunu bozmaz
  const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await tempClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
    },
  })

  if (error) throw error
  if (!data.user) throw new Error('Kullanıcı oluşturulamadı')

  // Trigger profili oluşturdu, ekstra alanları güncelle
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      email: email || null,
      company_name: company_name || null,
      phone: phone || null,
    })
    .eq('id', data.user.id)

  if (updateError) {
    console.error('Profile update error:', updateError)
  }

  return { userId: data.user.id }
}
