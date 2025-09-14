import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

// Generate a random password for new accounts
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

serve(async (req) => {
  const { method } = req

  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentIntentId, tempOrderId, email, items, amount, currency, metadata } = await req.json()

    // Validate payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify this is a guest payment
    if (paymentIntent.metadata.isGuest !== 'true' || paymentIntent.metadata.guestEmail !== email) {
      return new Response(
        JSON.stringify({ error: 'Invalid guest payment' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    let user
    let isNewAccount = false
    let existingOrdersMerged = false

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === email)

    if (existingUser) {
      // User exists, we'll associate the order with existing account
      user = existingUser
      console.log(`Guest order for existing user: ${email}`)
    } else {
      // Create new user account
      const randomPassword = generateRandomPassword()

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          created_via: 'guest_checkout',
          temp_order_id: tempOrderId
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      user = newUser.user
      isNewAccount = true
      console.log(`Created new user account: ${email}`)

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'user',
          created_via: 'guest_checkout'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Continue even if profile creation fails
      }
    }

    // Create the order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntentId,
        total_amount: amount,
        currency: currency.toUpperCase(),
        status: 'completed',
        payment_status: 'paid',
        metadata: {
          ...metadata,
          isGuest: true,
          guestEmail: email,
          tempOrderId,
          created_via: 'guest_checkout'
        },
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order record' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create order items
    if (items && Array.isArray(items)) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity || 1,
        metadata: {
          created_via: 'guest_checkout'
        }
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // Continue even if order items creation fails
      }
    }

    // If new account, send welcome email with password (you can implement this later)
    if (isNewAccount) {
      // TODO: Send welcome email with temporary password or magic link
      console.log(`Should send welcome email to ${email}`)
    }

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        order: {
          id: order.id,
          total_amount: order.total_amount,
          currency: order.currency,
          status: order.status,
          payment_status: order.payment_status,
          created_at: order.created_at
        },
        isNewAccount,
        existingOrdersMerged
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error processing guest order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})