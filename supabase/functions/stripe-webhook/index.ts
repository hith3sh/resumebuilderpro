import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('=== WEBHOOK CALLED ===')

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('CORS preflight request')
      return new Response('ok', { headers: corsHeaders })
    }

    // Simple health check
    if (req.url.includes('?test=true')) {
      console.log('Health check request')
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
          hasStripeKey: !!Deno.env.get('STRIPE_SECRET_KEY'),
          hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
          hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
          hasWebhookSecret: !!Deno.env.get('STRIPE_WEBHOOK_SECRET')
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Processing webhook request...')

    // Debug environment variables
    const envCheck = {
      hasStripeKey: !!Deno.env.get('STRIPE_SECRET_KEY'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasWebhookSecret: !!Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      supabaseUrl: Deno.env.get('SUPABASE_URL')?.substring(0, 30) + '...',
      serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.substring(0, 20) + '...'
    }
    console.log('Environment check:', envCheck)
  } catch (error) {
    console.error('Early error in webhook:', error)
    return new Response(JSON.stringify({ error: 'Early webhook error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {

  // Log all headers for debugging
  const allHeaders = {}
  for (const [key, value] of req.headers.entries()) {
    allHeaders[key] = value
  }
  console.log('All request headers:', allHeaders)

  const signature = req.headers.get('stripe-signature') || req.headers.get('Stripe-Signature')
  const body = await req.text()

  console.log('Signature check:', {
    signature: signature?.substring(0, 20) + '...',
    webhookSecret: webhookSecret?.substring(0, 20) + '...',
    bodyLength: body?.length
  })

  if (!signature) {
    console.error('Missing stripe signature header')
    return new Response(JSON.stringify({
      error: 'Missing stripe signature header',
      availableHeaders: Object.keys(allHeaders)
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (!webhookSecret) {
    console.error('Missing webhook secret environment variable')
    return new Response(JSON.stringify({
      error: 'Webhook secret not configured'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSuccess(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutSuccess(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.async_payment_failed':
        await handleCheckoutFailed(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
        break

      // Keep old payment intent handlers for backward compatibility
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, {
      status: 400,
      headers: corsHeaders
    })
  }
})

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)
  
  try {
    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (orderError) {
      console.error('Error updating order:', orderError)
      throw orderError
    }

    // Here you could add additional logic like:
    // - Send confirmation email
    // - Trigger fulfillment process
    // - Update inventory
    // - Send to external systems

    console.log('Order updated successfully for payment:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)
  
  try {
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (orderError) {
      console.error('Error updating failed order:', orderError)
      throw orderError
    }

    console.log('Order marked as failed for payment:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment failure:', error)
    throw error
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment canceled:', paymentIntent.id)

  try {
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'unpaid',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (orderError) {
      console.error('Error updating canceled order:', orderError)
      throw orderError
    }

    console.log('Order marked as canceled for payment:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
    throw error
  }
}

// Modern checkout session handlers
async function handleCheckoutSuccess(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)

  try {
    // Test Supabase connection first
    console.log('Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('count', { count: 'exact', head: true })

    if (testError) {
      console.error('Supabase connection test failed:', testError)
      throw new Error(`Supabase connection failed: ${testError.message}`)
    }

    console.log('Supabase connection successful, total orders:', testData)
    console.log('Attempting to update order with session ID:', session.id)

    // First, check if order exists
    const { data: existingOrder, error: findError } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('stripe_checkout_session_id', session.id)
      .single()

    if (findError) {
      console.error('Error finding order for session:', findError)
      throw findError
    }

    console.log('Found order:', existingOrder)

    // Update order status using session ID
    const { data: updatedOrder, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_checkout_session_id', session.id)
      .select()

    if (orderError) {
      console.error('Error updating order for session:', orderError)
      throw orderError
    }

    console.log('Order updated successfully:', updatedOrder)
  } catch (error) {
    console.error('Error handling checkout success:', error)
    throw error
  }
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  console.log('Checkout session payment failed:', session.id)

  try {
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_checkout_session_id', session.id)

    if (orderError) {
      console.error('Error updating failed order for session:', orderError)
      throw orderError
    }

    console.log('Order marked as failed for checkout session:', session.id)
  } catch (error) {
    console.error('Error handling checkout failure:', error)
    throw error
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  console.log('Checkout session expired:', session.id)

  try {
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'unpaid',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_checkout_session_id', session.id)

    if (orderError) {
      console.error('Error updating expired order for session:', orderError)
      throw orderError
    }

    console.log('Order marked as expired for checkout session:', session.id)
  } catch (error) {
    console.error('Error handling checkout expiration:', error)
    throw error
  }
}