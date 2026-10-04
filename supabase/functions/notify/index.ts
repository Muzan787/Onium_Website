/// <reference lib="deno.ns" />

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// API Keys
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const FROM_ADDRESS = 'Onium Store <rabta@onium.store>'
const ADMIN_EMAIL = 'rabta@onium.store'
// Every admin notification is copied here as well.
const ADMIN_CC = ['huzaifapu@gmail.com']
const SITE_URL = 'https://onium.store'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  product_title: string
  quantity: number
  price_at_purchase: number
}

const money = (n: number) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Checkout inserts the order row first and the line items immediately after,
 * so this trigger can fire before the items land. Try once, and if nothing is
 * there yet give it a moment and try again. Callers must tolerate an empty
 * array — the emails still send without the itemised list.
 */
async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return []

  const url = `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}` +
    `&select=product_title,quantity,price_at_purchase`

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(1500)
    try {
      const res = await fetch(url, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      })
      if (!res.ok) continue
      const items = await res.json()
      if (Array.isArray(items) && items.length > 0) return items as OrderItem[]
    } catch (err) {
      console.error('fetchOrderItems failed:', err)
    }
  }

  console.warn(`No order_items found for order ${orderId} — sending without the itemised list.`)
  return []
}

/** Pakistani numbers are stored in assorted shapes; wa.me needs digits only. */
function toWhatsAppNumber(raw: string): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('92')) return digits          // 923001234567
  if (digits.startsWith('0')) return `92${digits.slice(1)}` // 03001234567
  if (digits.length === 10) return `92${digits}`      // 3001234567
  return digits
}

function itemsSummaryText(items: OrderItem[]): string {
  if (items.length === 0) return ''
  return items.map((i) => `${i.quantity}x ${i.product_title}`).join(', ')
}

function itemsRowsHtml(items: OrderItem[], dark: boolean): string {
  if (items.length === 0) return ''
  const labelColor = dark ? '#94a3b8' : '#6b7280'
  const textColor = dark ? '#ffffff' : '#111827'
  const borderColor = dark ? '#334155' : '#e5e7eb'

  return items.map((i) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid ${borderColor}; font-size: 14px; color: ${textColor};">
        ${escapeHtml(i.product_title)}
        <span style="color: ${labelColor};"> &times; ${i.quantity}</span>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid ${borderColor}; font-size: 14px; color: ${textColor}; text-align: right; white-space: nowrap;">
        ${money(i.price_at_purchase * i.quantity)}
      </td>
    </tr>
  `).join('')
}

function customerEmailHtml(opts: {
  id: string
  customerName: string
  totalPrice: number
  items: OrderItem[]
}): string {
  const shortId = opts.id.slice(0, 8).toUpperCase()
  const rows = itemsRowsHtml(opts.items, true)

  return `
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
                  Hi <strong style="color: #ffffff;">${escapeHtml(opts.customerName)}</strong>, thank you for your purchase. We are getting your eco-friendly products ready for shipment.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 0 40px 30px 40px;">
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; border-radius: 16px; border: 1px solid #334155;">
                  <tr>
                    <td style="padding: 20px; text-align: left;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Order ID</p>
                      <p style="margin: 0 0 20px 0; font-size: 18px; color: #ffffff; font-family: monospace;">#${shortId}</p>

                      ${rows ? `
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Your Items</p>
                      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                        ${rows}
                      </table>
                      ` : ''}

                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Total Amount</p>
                      <p style="margin: 0 0 6px 0; font-size: 24px; color: #059669; font-weight: 800;">${money(opts.totalPrice)}</p>
                      <p style="margin: 0; font-size: 13px; color: #64748b;">Pay on delivery &mdash; online transfer preferred over cash.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 0 40px 40px 40px;">
                <a href="${SITE_URL}/track-order" style="background-color: #059669; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 48px; border-radius: 12px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);">
                  Track Your Order
                </a>
              </td>
            </tr>

          </table>

          <table role="presentation" class="content-width" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding-top: 24px;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">
                  &copy; 2026 Onium Store. All rights reserved.<br>Islamabad, Pakistan
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `
}

function adminOrderEmailHtml(opts: {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  instructions: string
  totalPrice: number
  items: OrderItem[]
  whatsAppUrl: string | null
}): string {
  const shortId = opts.id.slice(0, 8).toUpperCase()
  const rows = itemsRowsHtml(opts.items, false)

  const detailRow = (label: string, value: string) => `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #6b7280; width: 110px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600;">${value}</td>
    </tr>
  `

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; }
      .content-width { width: 100%; max-width: 600px; margin: 0 auto; }
      @media screen and (max-width: 600px) { .padding-container { padding: 20px !important; } }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; color: #111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9;">
      <tr>
        <td align="center" style="padding: 32px 0;">

          <table role="presentation" class="content-width" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden;">

            <tr>
              <td style="background: linear-gradient(90deg, #059669 0%, #0ea5e9 100%); padding: 24px 32px;">
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">New Order</p>
                <p style="margin: 6px 0 0 0; font-size: 26px; color: #ffffff; font-weight: 800;">${money(opts.totalPrice)}</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.9); font-family: monospace;">#${shortId}</p>
              </td>
            </tr>

            <tr>
              <td class="padding-container" style="padding: 28px 32px 8px 32px;">
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Customer</p>
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                  ${detailRow('Name', escapeHtml(opts.customerName))}
                  ${detailRow('Phone', escapeHtml(opts.customerPhone))}
                  ${detailRow('Email', escapeHtml(opts.customerEmail))}
                  ${detailRow('Address', escapeHtml(opts.customerAddress))}
                  ${opts.instructions ? detailRow('Notes', escapeHtml(opts.instructions)) : ''}
                </table>
              </td>
            </tr>

            ${rows ? `
            <tr>
              <td class="padding-container" style="padding: 20px 32px 8px 32px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Items</p>
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                  ${rows}
                  <tr>
                    <td style="padding: 14px 0 0 0; font-size: 15px; font-weight: 800; color: #111827;">Total</td>
                    <td style="padding: 14px 0 0 0; font-size: 15px; font-weight: 800; color: #059669; text-align: right;">${money(opts.totalPrice)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            ` : ''}

            ${opts.whatsAppUrl ? `
            <tr>
              <td align="center" class="padding-container" style="padding: 28px 32px 8px 32px;">
                <a href="${opts.whatsAppUrl}" style="background-color: #25D366; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 32px; border-radius: 12px; display: block; text-align: center; box-shadow: 0 8px 12px -3px rgba(37, 211, 102, 0.35);">
                  Message ${escapeHtml(opts.customerName)} on WhatsApp
                </a>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">Opens a chat with the order details already written out.</p>
              </td>
            </tr>
            ` : `
            <tr>
              <td class="padding-container" style="padding: 20px 32px 0 32px;">
                <p style="margin: 0; font-size: 13px; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px;">
                  No usable phone number on this order, so there's no WhatsApp button.
                </p>
              </td>
            </tr>
            `}

            <tr>
              <td align="center" class="padding-container" style="padding: 16px 32px 32px 32px;">
                <a href="${SITE_URL}/admin/orders" style="color: #0ea5e9; font-size: 14px; font-weight: 700; text-decoration: none;">
                  Open in Admin Dashboard &rarr;
                </a>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `
}

async function sendEmail(payload: Record<string, unknown>, label: string) {
  if (!RESEND_API_KEY) {
    console.warn(`RESEND_API_KEY missing — skipping ${label}`)
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    console.log(`Resend (${label}):`, JSON.stringify(data))
  } catch (err) {
    // One failed email must not stop the others from going out.
    console.error(`Resend (${label}) failed:`, err)
  }
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
      const {
        id,
        customer_email,
        customer_name,
        customer_phone,
        customer_address,
        special_instructions,
        total_price,
      } = record

      const shortId = String(id).slice(0, 8).toUpperCase()
      const items = await fetchOrderItems(id)

      // --- WhatsApp deep link for the admin, pre-filled with the order ---
      const waNumber = toWhatsAppNumber(customer_phone)
      const itemsText = itemsSummaryText(items)
      const waMessage =
        `Thanks for ordering from Onium! ` +
        `Your order details: #${shortId}` +
        (itemsText ? ` — ${itemsText}` : '') +
        ` — Total ${money(total_price)}. ` +
        `Please let us know how soon you would like the delivery?`
      const whatsAppUrl = waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`
        : null

      // --- 1. CUSTOMER CONFIRMATION ---
      await sendEmail({
        from: FROM_ADDRESS,
        to: [customer_email],
        subject: `Order Confirmed! #${shortId}`,
        html: customerEmailHtml({
          id,
          customerName: customer_name,
          totalPrice: total_price,
          items,
        }),
      }, 'customer order confirmation')

      // --- 2. ADMIN NOTIFICATION (cc'd to the second admin) ---
      await sendEmail({
        from: FROM_ADDRESS,
        to: [ADMIN_EMAIL],
        cc: ADMIN_CC,
        subject: `New Order ${money(total_price)} — ${customer_name} (#${shortId})`,
        html: adminOrderEmailHtml({
          id,
          customerName: customer_name,
          customerEmail: customer_email,
          customerPhone: customer_phone,
          customerAddress: customer_address,
          instructions: special_instructions,
          totalPrice: total_price,
          items,
          whatsAppUrl,
        }),
      }, 'admin order notification')
    }

    // --- HANDLE NEW REVIEWS ---
    if (table === 'reviews') {
      const { customer_name, rating, comment } = record
      await sendEmail({
        from: FROM_ADDRESS,
        to: [ADMIN_EMAIL],
        cc: ADMIN_CC,
        subject: `New ${rating}-Star Review`,
        html: `
          <div style="font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; background:#f1f5f9; padding:32px;">
            <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden;">
              <div style="background: linear-gradient(90deg, #059669 0%, #0ea5e9 100%); padding:20px 28px;">
                <p style="margin:0; font-size:12px; color:rgba(255,255,255,0.85); text-transform:uppercase; letter-spacing:2px; font-weight:700;">New Review</p>
                <p style="margin:6px 0 0 0; font-size:22px; color:#ffffff; font-weight:800;">${escapeHtml(rating)} / 5</p>
              </div>
              <div style="padding:24px 28px;">
                <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280;">From</p>
                <p style="margin:0 0 18px 0; font-size:15px; color:#111827; font-weight:700;">${escapeHtml(customer_name)}</p>
                <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280;">Comment</p>
                <p style="margin:0 0 24px 0; font-size:15px; color:#111827; line-height:1.6;">${escapeHtml(comment)}</p>
                <a href="${SITE_URL}/admin/reviews" style="color:#0ea5e9; font-size:14px; font-weight:700; text-decoration:none;">Manage Reviews &rarr;</a>
              </div>
            </div>
          </div>
        `,
      }, 'admin review notification')
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error("Function Error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
