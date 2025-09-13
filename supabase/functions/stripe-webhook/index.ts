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

serve(async (req) => {
  // Debug environment variables
  console.log('Environment check:', {
    hasStripeKey: !!Deno.env.get('STRIPE_SECRET_KEY'),
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    hasWebhookSecret: !!Deno.env.get('STRIPE_WEBHOOK_SECRET')
  })

  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
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
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
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