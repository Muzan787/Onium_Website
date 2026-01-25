/// <reference lib="deno.ns" />

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// API Keys
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_FROM_WHATSAPP = Deno.env.get('TWILIO_FROM_WHATSAPP')
const ADMIN_EMAIL = 'muazahmad787@gmail.com'
const ADMIN_PHONE = 'whatsapp:+923236306556'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { type, table, record } = payload

    // Only process INSERT events
    if (type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Not an INSERT event' }), { headers: { 'Content-Type': 'application/json' } })
    }

    // --- HANDLE NEW ORDERS ---
    if (table === 'orders') {
      const { id, customer_email, customer_name, total_price } = record

      // 1. Email to Customer (Resend)
      if (RESEND_API_KEY) {
        console.log(`Sending email to ${customer_email}...`)
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Onium Store <onboarding@resend.dev>', // Change this to your verified domain later
            to: [customer_email],
            subject: `Order Confirmation #${id.slice(0, 8)}`,
            html: `<h1>Thank you, ${customer_name}!</h1><p>Order ID: ${id}</p><p>Total: Rs${total_price}</p>`,
          }),
        })
        const data = await res.json()
        console.log("Resend Customer Response:", JSON.stringify(data))

        // 2. Email to Admin
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Onium Store <onboarding@resend.dev>',
            to: [ADMIN_EMAIL],
            subject: `New Order: #${id.slice(0, 8)}`,
            html: `<p>New order from <strong>${customer_name}</strong> for Rs${total_price}.</p>`,
          }),
        })
      }

      // 3. WhatsApp to Admin (Twilio)
      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        console.log(`Sending WhatsApp to Admin...`)
        const body = new URLSearchParams({
          To: ADMIN_PHONE,
          From: TWILIO_FROM_WHATSAPP!,
          Body: `🔔 *New Order!* \n👤 ${customer_name}\n💰 Rs${total_price}\n🆔 ${id.slice(0, 8)}`,
        })

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        })
        const data = await res.json()
        console.log("Twilio Response:", JSON.stringify(data))
      }
    }

    // --- HANDLE NEW REVIEWS ---
    if (table === 'reviews') {
      const { customer_name, rating, comment } = record

      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        console.log(`Sending Review Notification...`)
        const body = new URLSearchParams({
          To: ADMIN_PHONE,
          From: TWILIO_FROM_WHATSAPP!,
          Body: `⭐ *New Review!*\n👤 ${customer_name}\n⭐ ${rating}/5\n💬 "${comment}"`,
        })

        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        })
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error("Function Error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})