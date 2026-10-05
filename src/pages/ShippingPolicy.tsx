import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import { AtAGlance, PolicySection } from '../components/Policy';
import { formatRs } from '../lib/format';
import { DELIVERY_FEE, FREE_DELIVERY_FROM } from '../lib/pricing';
import { PHONE_DISPLAY, WHATSAPP_URL } from '../lib/contact';

export default function ShippingPolicy() {
  return (
    <div>
      <SEO title="Shipping policy" description="Where Onium delivers, how fast, and what delivery costs." />
      <PageIntro title="Shipping policy" lede="Where we deliver, how fast, and what it costs." />

      <div className="container mx-auto px-4 py-10 md:py-16">
        <AtAGlance
          items={[
            { label: 'We deliver in', value: 'Islamabad & Rawalpindi' },
            { label: 'Standard delivery', value: '24 to 48 hours' },
            {
              label: 'Delivery',
              value: `Free from ${formatRs(FREE_DELIVERY_FROM)}`,
              note: `${formatRs(DELIVERY_FEE)} on smaller orders`,
            },
          ]}
        />

        <div className="mt-4">
          <PolicySection title="Where we deliver">
            <p>
              We deliver within <strong>Islamabad and Rawalpindi</strong>. We're a growing business and plan to reach
              other major cities soon.
            </p>
          </PolicySection>

          <PolicySection title="Delivery times">
            <p>Because we deliver locally, we can deliver fast.</p>
            <ul>
              <li>
                <strong>Standard delivery:</strong> 24 to 48 hours.
              </li>
              <li>
                <strong>Same-day delivery:</strong> orders placed before 12:00 PM are often delivered the same day,
                subject to rider availability.
              </li>
              <li>
                <strong>Sundays and holidays:</strong> orders placed on weekends are processed the next working day.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Delivery costs">
            <ul>
              <li>
                <strong>{formatRs(DELIVERY_FEE)}</strong> flat rate for orders under {formatRs(FREE_DELIVERY_FROM)}.
              </li>
              <li>
                <strong>Free delivery</strong> on orders of {formatRs(FREE_DELIVERY_FROM)} or more.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Damaged or incorrect items">
            <p>
              We take great care with packaging, but accidents happen. If you receive a leaking bottle or the wrong
              product:
            </p>
            <ol>
              <li>Take a clear photo of the item as soon as it arrives.</li>
              <li>
                Send the photo to us on{' '}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-700 underline underline-offset-2">
                  WhatsApp at {PHONE_DISPLAY}
                </a>{' '}
                within 24 hours.
              </li>
              <li>We'll send a replacement free of charge or refund you.</li>
            </ol>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
