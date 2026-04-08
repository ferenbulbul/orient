import { supabase } from './supabase'

export async function getEmailEnabled() {
  const { data } = await supabase
    .from('app_settings')
    .select('email_notifications')
    .eq('id', 1)
    .single()

  return data?.email_notifications ?? true
}

export async function setEmailEnabled(enabled) {
  const { error } = await supabase
    .from('app_settings')
    .update({ email_notifications: enabled, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) console.error('Settings update error:', error)
  return !error
}
