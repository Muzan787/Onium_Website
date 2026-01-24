/// <reference lib="deno.ns" />
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// API Keys from Environment Variables
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_FROM_WHATSAPP = Deno.env.get('TWILIO_FROM_WHATSAPP') // e.g., "whatsapp:+14155238886"
const ADMIN_EMAIL = 'admin@onium.com'
const ADMIN_PHONE = 'whatsapp:+923231550147' // Your admin WhatsApp number

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
      const orderId = record.id
      const customerEmail = record.customer_email
      const customerName = record.customer_name
      const totalAmount = record.total_price

      // 1. Send Email Confirmation to Customer (via Resend)
      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Onium Store <onboarding@resend.dev>', // Use 'onboarding@resend.dev' for testing
            to: [customerEmail],
            subject: `Order Confirmation #${orderId.slice(0, 8)}`,
            html: `
              <h1>Thank you for your order, ${customerName}!</h1>
              <p>We have received your order.</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Total Amount:</strong> Rs${totalAmount}</p>
              <p>We will notify you when it ships.</p>
            `,
          }),
        })

        // 2. Send Notification to Admin (Email)
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Onium System <onboarding@resend.dev>',
            to: [ADMIN_EMAIL],
            subject: `New Order Received: #${orderId.slice(0, 8)}`,
            html: `
              <h2>New Order Alert</h2>
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Total:</strong> Rs${totalAmount}</p>
              <a href="https://onium.store/admin/orders">View Order</a>
            `,
          }),
        })
      }

      // 3. Send Notification to Admin (WhatsApp via Twilio)
      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        const messageBody = `🔔 *New Order Received!* \n\n👤 Customer: ${customerName}\n💰 Total: Rs${totalAmount}\n📄 ID: ${orderId.slice(0, 8)}\n\nCheck dashboard for details.`
        
        const formBody = new URLSearchParams({
          To: ADMIN_PHONE,
          From: TWILIO_FROM_WHATSAPP!,
          Body: messageBody,
        })

        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody.toString(),
        })
      }
    }

    // --- HANDLE NEW REVIEWS ---
    if (table === 'reviews') {
      const reviewer = record.customer_name
      const rating = record.rating
      const comment = record.comment

      // Send WhatsApp Notification to Admin
      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        const messageBody = `⭐ *New Review Posted* \n\n👤 User: ${reviewer}\n⭐ Rating: ${rating}/5\n💬 Comment: "${comment}"\n\nPlease approve in dashboard.`
        
        const formBody = new URLSearchParams({
          To: ADMIN_PHONE,
          From: TWILIO_FROM_WHATSAPP!,
          Body: messageBody,
        })

        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody.toString(),
        })
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error)
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})


