import { MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import { AtAGlance, PolicySection } from '../components/Policy';
import { PHONE_DISPLAY, whatsappWith } from '../lib/contact';

const RETURN_MESSAGE = "Hi Onium, I'd like to return an item. My order number is #";

export default function ReturnPolicy() {
  return (
    <div>
      <SEO title="Returns and refunds" description="Onium's 7-day no questions asked returns policy and how refunds work." />
      <PageIntro
        title="Returns and refunds"
        lede="We want you to love our products. If you don't, we're here to help."
      />

      <div className="container mx-auto px-4 py-10 md:py-16">
        <AtAGlance
          items={[
            { label: 'Start a return within', value: '7 days', note: 'of delivery' },
            { label: 'Refunds processed in', value: '24 to 48 hours', note: 'once we have your return or photo' },
            { label: 'Refunded to', value: 'Bank or wallet', note: 'EasyPaisa or JazzCash' },
          ]}
        />

        <div className="mt-4">
          <PolicySection title="Our 7-day guarantee">
            <p>
              We stand by our cleaning products. If you receive a damaged product or the wrong item, or you're simply
              not happy with the results, you can return it within <strong>7 days of delivery</strong>, no questions
              asked.
            </p>
          </PolicySection>

          <PolicySection title="What can be returned">
            <ul>
              <li>Returns must be started within 7 days of delivery.</li>
              <li>
                <strong>Damaged or leaking items:</strong> send us a photo as proof.
              </li>
              <li>
                <strong>Change of mind:</strong> the product must be unused, sealed and in its original packaging.
              </li>
              <li>
                <strong>Didn't work as expected:</strong> if you used it and it didn't do the job, contact us for advice
                or a refund.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="How to start a return">
            <p>No forms to fill in.</p>
            <ol>
              <li>Message us on WhatsApp at {PHONE_DISPLAY}.</li>
              <li>Share your order number (for example #12AB34CD) and why you're returning it.</li>
              <li>If the item is damaged, attach a photo.</li>
              <li>We'll approve the return and tell you what happens next.</li>
            </ol>
            <a
              href={whatsappWith(RETURN_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="!mt-6 inline-flex items-center gap-2 min-h-12 px-6 rounded-full bg-[#25D366] text-ink font-semibold hover:brightness-95 transition-[filter]"
            >
              <MessageCircle className="w-[18px] h-[18px]" aria-hidden />
              Start a return on WhatsApp
            </a>
          </PolicySection>

          <PolicySection title="Refunds">
            <p>
              Once we receive your return, or the photo for a damaged item, we process your refund within{' '}
              <strong>24 to 48 hours</strong>, to either:
            </p>
            <ul>
              <li>
                <strong>Bank transfer:</strong> to your Meezan, HBL or other bank account.
              </li>
              <li>
                <strong>Mobile wallet:</strong> EasyPaisa or JazzCash.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Return delivery costs">
            <p>
              For change-of-mind returns, you pay the return delivery. For damaged or incorrect items, we cover every
              cost.
            </p>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
