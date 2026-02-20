// Supabase Edge Function: manage-agent
// Supports: create and delete agents
// Deploy: paste this code in Supabase Dashboard → Edge Functions → smart-responder → Code

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Admin client with service role key (has full access)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        )

        // Anon client to verify the caller
        const supabaseAnon = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_ANON_KEY')
        )

        // Verify the caller is an admin
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'No autorizado' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user: caller }, error: authError } = await supabaseAnon.auth.getUser(token)

        if (authError || !caller) {
            return new Response(
                JSON.stringify({ error: 'Token inválido' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check caller's role
        const { data: callerProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', caller.id)
            .single()

        if (callerProfile?.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'Solo los administradores pueden gestionar agentes' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const body = await req.json()
        const action = body.action || 'create'

        // ─── DELETE AGENT ───
        if (action === 'delete') {
            const { agent_id } = body

            if (!agent_id) {
                return new Response(
                    JSON.stringify({ error: 'agent_id es obligatorio' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Delete profile first
            await supabaseAdmin.from('profiles').delete().eq('id', agent_id)

            // Delete auth user
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(agent_id)

            if (deleteError) {
                return new Response(
                    JSON.stringify({ error: deleteError.message }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            return new Response(
                JSON.stringify({ message: 'Agente eliminado exitosamente' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ─── CREATE AGENT ───
        const { email, password, full_name, phone } = body

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: 'Email y contraseña son obligatorios' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: full_name || '',
                role: 'agent',
            }
        })

        if (createError) {
            return new Response(
                JSON.stringify({ error: createError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Update phone if provided
        if (phone && newUser?.user?.id) {
            await supabaseAdmin
                .from('profiles')
                .update({ phone })
                .eq('id', newUser.user.id)
        }

        return new Response(
            JSON.stringify({ user: newUser.user, message: 'Agente creado exitosamente' }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
