import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('=== WEBHOOK CALLED ===')

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

  try {
    console.log('Processing webhook request...')

    // Initialize services
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

    // Debug environment variables
    console.log('Environment check:', {
      hasStripeKey: !!Deno.env.get('STRIPE_SECRET_KEY'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasWebhookSecret: !!Deno.env.get('STRIPE_WEBHOOK_SECRET')
    })

    // Get signature and body
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    console.log('Request details:', {
      hasSignature: !!signature,
      hasWebhookSecret: !!webhookSecret,
      bodyLength: body?.length
    })

    if (!signature) {
      console.error('Missing stripe signature header')
      return new Response(JSON.stringify({
        error: 'Missing stripe signature header'
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

    // Verify webhook signature (async version for Deno/Edge runtime)
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    console.log(`Processing webhook event: ${event.type}`)

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Checkout session completed:', session.id)

      // Test Supabase connection
      const { data: testData, error: testError } = await supabase
        .from('orders')
        .select('count', { count: 'exact', head: true })

      if (testError) {
        console.error('Supabase connection test failed:', testError)
        throw new Error(`Supabase connection failed: ${testError.message}`)
      }

      console.log('Supabase connection successful')

      // Check if this is a guest checkout
      const isGuestCheckout = session.metadata?.isGuest === 'true'

      if (isGuestCheckout) {
        console.log('Processing guest checkout completion')
        // Get email from Stripe customer info instead of metadata
        const guestEmail = session.customer_details?.email || session.customer_email
        const items = session.metadata?.items ? JSON.parse(session.metadata.items) : []

        if (!guestEmail) {
          console.error('Guest email missing from session customer details')
          return
        }

        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(u => u.email === guestEmail)

        let userId;
        let isNewAccount = false;

        if (existingUser) {
          userId = existingUser.id
          console.log(`Associating order with existing user: ${guestEmail}`)
        } else {
          // Create new user account
          const randomPassword = Math.random().toString(36).slice(-12) + 'A1!'

          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: guestEmail,
            password: randomPassword,
            email_confirm: true,
            user_metadata: {
              created_via: 'guest_checkout',
              checkout_session_id: session.id
            }
          })

          if (createError) {
            console.error('Error creating user account:', createError)
            throw createError
          }

          userId = newUser.user.id
          isNewAccount = true
          console.log(`Created new user account: ${guestEmail}`)

          // Create user profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: guestEmail,
              role: 'user',
              created_via: 'guest_checkout'
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }

        }

        // Create the order record
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            stripe_checkout_session_id: session.id,
            total_amount: session.amount_total,
            currency: session.currency?.toUpperCase() || 'USD',
            status: 'completed',
            payment_status: 'paid',
            metadata: {
              ...session.metadata,
              isGuest: true,
              guestEmail,
              created_via: 'guest_checkout_webhook'
            },
          })
          .select()
          .single()

        if (orderError) {
          console.error('Error creating guest order:', orderError)
          throw orderError
        }

        // Create order items
        if (items && Array.isArray(items)) {
          const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            price: item.price,
            quantity: item.quantity || 1,
          }))

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

          if (itemsError) {
            console.error('Error creating guest order items:', itemsError)
          }
        }

        console.log('Guest checkout completed successfully:', order.id)

        // Send welcome/confirmation email after successful order creation
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: guestEmail,
              firstName: session.metadata?.firstName || null,
              lastName: session.metadata?.lastName || null,
              isNewAccount: isNewAccount,
              orderId: order.id,
              orderTotal: `$${(session.amount_total / 100).toFixed(2)}`,
              temporaryPassword: isNewAccount ? randomPassword : null,
              loginUrl: `${Deno.env.get('SITE_URL') || 'https://your-domain.com'}/login`
            }
          })
          console.log(`${isNewAccount ? 'Welcome' : 'Confirmation'} email sent successfully`)
        } catch (emailError) {
          console.error('Error sending email:', emailError)
          // Don't fail the whole process if email fails
        }
      } else {
        // Regular authenticated checkout
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
          console.error('Error updating order:', orderError)
          throw orderError
        }

        console.log('Order updated successfully:', updatedOrder)
      }
    }
    // Handle payment intent succeeded (for guest checkout)
    else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment intent succeeded:', paymentIntent.id)

      // Check if this is a guest checkout
      if (paymentIntent.metadata?.isGuest === 'true') {
        console.log('Processing guest checkout payment:', paymentIntent.metadata.guestEmail)

        // Update order status if it exists (it might already be processed by the client)
        const { data: existingOrder, error: findError } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (existingOrder) {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'completed',
              payment_status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingOrder.id)

          if (updateError) {
            console.error('Error updating guest order:', updateError)
          } else {
            console.log('Guest order updated successfully')
          }
        } else {
          console.log('Guest order not found - likely processed by client already')
        }
      } else {
        // Regular payment intent (authenticated checkout)
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
        } else {
          console.log('Order updated successfully')
        }
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      details: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})