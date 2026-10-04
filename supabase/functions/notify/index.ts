/// <reference lib="deno.ns" />

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// API Keys
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = 'rabta@onium.store'

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

      if (RESEND_API_KEY) {
        // --- 1. SEND STYLED EMAIL TO CUSTOMER ---
        console.log(`Sending email to ${customer_email}...`)

        const customerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmed</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; padding: 0; background-color: #0f172a; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; }
              .content-width { width: 100%; max-width: 600px; margin: 0 auto; }
              @media screen and (max-width: 600px) {
                .padding-container { padding: 20px !important; }
                .mobile-text { font-size: 28px !important; }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f172a; color: #ffffff;">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a;">
              <tr>
                <td align="center" style="padding: 40px 0;">

                  <table role="presentation" class="content-width" cellspacing="0" cellpadding="0" border="0" style="background-color: #1e293b; border-radius: 24px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">

                    <tr>
                      <td align="center" style="padding: 40px 0 20px 0;">
                        <div style="background: linear-gradient(90deg, #059669 0%, #0ea5e9 100%); padding: 8px; border-radius: 12px; display: inline-block;">
                          <img src="https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png" alt="Onium Logo" width="140" style="display: block; max-width: 140px;">
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" class="padding-container" style="padding: 0 40px;">
                        <h1 class="mobile-text" style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.025em;">
                          Order Confirmed!
                        </h1>
                        <p style="margin: 0 0 24px 0; font-size: 16px; color: #94a3b8; line-height: 1.6;">
                          Hi <strong style="color: #ffffff;">${customer_name}</strong>, thank you for your purchase. We are getting your eco-friendly products ready for shipment.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding: 0 40px 30px 40px;">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; border-radius: 16px; border: 1px solid #334155;">
                          <tr>
                            <td style="padding: 20px; text-align: left;">
                              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Order ID</p>
                              <p style="margin: 0 0 20px 0; font-size: 18px; color: #ffffff; font-family: monospace;">#${id.slice(0, 8).toUpperCase()}</p>

                              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Total Amount</p>
                              <p style="margin: 0; font-size: 24px; color: #059669; font-weight: 800;">Rs ${total_price.toLocaleString()}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding: 0 40px 40px 40px;">
                        <a href="https://onium.store/track-order" style="background-color: #059669; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 48px; border-radius: 12px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);">
                          Track Your Order
                        </a>
                      </td>
                    </tr>

                  </table>

                  <table role="presentation" class="content-width" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding-top: 24px;">
                        <p style="color: #64748b; font-size: 12px; margin: 0;">
                          © 2026 Onium Store. All rights reserved.<br>Islamabad, Pakistan
                        </p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Onium Store <rabta@onium.store>',
            to: [customer_email],
            subject: `Order Confirmed! #${id.slice(0, 8).toUpperCase()}`,
            html: customerEmailHtml,
          }),
        })
        const data = await res.json()
        console.log("Resend Customer Response:", JSON.stringify(data))

        // --- 2. EMAIL TO ADMIN (Simple Notification) ---
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Onium Store <rabta@onium.store>',
            to: [ADMIN_EMAIL],
            subject: `💰 New Order: Rs ${total_price}`,
            html: `
              <h1>New Order Received!</h1>
              <p><strong>Customer:</strong> ${customer_name}</p>
              <p><strong>Total:</strong> Rs ${total_price}</p>
              <p><strong>Order ID:</strong> ${id}</p>
              <p><a href="https://onium.store/admin">View in Admin Dashboard</a></p>
            `,
          }),
        })
      }
    }

    // --- HANDLE NEW REVIEWS (Optional: Send Email to Admin instead of WhatsApp) ---
    if (table === 'reviews') {
        const { customer_name, rating, comment } = record;
        if (RESEND_API_KEY) {
             await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'Onium Store <rabta@onium.store>',
                    to: [ADMIN_EMAIL],
                    subject: `⭐ New ${rating}-Star Review`,
                    html: `
                    <h2>New Review Received</h2>
                    <p><strong>Customer:</strong> ${customer_name}</p>
                    <p><strong>Rating:</strong> ${rating}/5</p>
                    <p><strong>Comment:</strong> "${comment}"</p>
                    <p><a href="https://onium.store/admin/reviews">Manage Reviews</a></p>
                    `,
                }),
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
