// Supabase Edge Function: create-user
// Deploy: supabase functions deploy create-user
// Bu fonksiyon admin/personel tarafından yeni kullanıcı oluşturmak için kullanılır.
// Client SDK ile auth.admin.createUser yapılamadığı için Edge Function gerekir.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Caller'ın auth token'ını kontrol et
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Anon client ile caller'ın rolünü kontrol et
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Caller'ın rolünü kontrol et
    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (!callerProfile || !['personel', 'admin'].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Request body
    const { email, password, full_name, company_name, phone, role } = await req.json()

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: 'Email and full_name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Admin client ile kullanıcı oluştur
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-10),
      email_confirm: true,
      user_metadata: {
        full_name,
        role: role || 'musteri',
      },
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Profile'ı güncelle (trigger ile oluşturulmuş olacak)
    if (newUser.user) {
      await adminClient
        .from('profiles')
        .update({
          company_name: company_name || null,
          phone: phone || null,
          full_name,
          role: role || 'musteri',
        })
        .eq('id', newUser.user.id)
    }

    return new Response(
      JSON.stringify({
        user_id: newUser.user?.id,
        message: 'User created successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
