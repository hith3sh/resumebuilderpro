import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      email, 
      customerName, 
      orderId, 
      orderTotal, 
      serviceName,
      dashboardUrl 
    } = await req.json()

    if (!email || !orderId) {
      throw new Error('Email and order ID are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Use resetPasswordForEmail to trigger "Reset Password" template for payment confirmations
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: dashboardUrl || `${Deno.env.get('SITE_URL')}/dashboard`,
      data: {
        email_type: 'payment_confirmation',
        customer_name: customerName,
        order_id: orderId,
        order_total: orderTotal,
        service_name: serviceName,
        purpose: 'order_confirmation'
      }
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment confirmation sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
