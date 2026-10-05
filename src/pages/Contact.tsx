import { ReactNode, useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import Field from '../components/Field';
import { ADDRESS, EMAIL, MAP_URL, PHONE_DISPLAY, PHONE_HREF, SUPPORT_HOURS, WHATSAPP_URL, whatsappWith } from '../lib/contact';

const TOPICS = ['An order', 'A product question', 'A bulk order', 'Something else'];

export default function Contact() {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [showError, setShowError] = useState(false);

  // There is no inbox behind this form, so rather than pretend to send it, the
  // message is handed to WhatsApp or the customer's email app, ready to go.
  const compose = () =>
    [`Hi Onium${name.trim() ? `, this is ${name.trim()}` : ''}.`, `About: ${topic.toLowerCase()}`, '', message.trim()].join('\n');

  const send = (via: 'whatsapp' | 'email') => {
    if (!message.trim()) {
      setShowError(true);
      document.getElementById('contact-message')?.focus();
      return;
    }
    const url =
      via === 'whatsapp'
        ? whatsappWith(compose())
        : `mailto:${EMAIL}?subject=${encodeURIComponent(`Question about ${topic.toLowerCase()}`)}&body=${encodeURIComponent(compose())}`;
    window.open(url, via === 'whatsapp' ? '_blank' : '_self', 'noopener');
  };

  return (
    <div>
      <SEO title="Contact us" description="Reach Onium on WhatsApp, by phone or email about orders, products or bulk pricing." />
      <PageIntro title="Talk to us" lede={`Orders, products and bulk quotes. We're on WhatsApp ${SUPPORT_HOURS}.`}>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-[52px] px-7 rounded-full bg-[#25D366] text-ink font-semibold hover:brightness-95 transition-[filter]"
        >
          <MessageCircle className="w-[18px] h-[18px]" aria-hidden />
          Chat on WhatsApp
        </a>
      </PageIntro>

      <div className="container mx-auto px-4 py-12 md:py-20 lg:grid lg:grid-cols-12 lg:gap-16">
        <section aria-labelledby="reach-heading" className="lg:col-span-5">
          <h2 id="reach-heading" className="font-display font-extrabold text-ink text-[28px] md:text-4xl">
            Other ways to reach us
          </h2>
          <ul className="mt-6 border-t border-ink/10">
            <ContactRow icon={<Phone className="w-5 h-5" />} label="Call" value={PHONE_DISPLAY} href={PHONE_HREF} />
            <ContactRow icon={<Mail className="w-5 h-5" />} label="Email" value={EMAIL} href={`mailto:${EMAIL}`} />
            <ContactRow icon={<MapPin className="w-5 h-5" />} label="Visit" value={ADDRESS} href={MAP_URL} external />
          </ul>
        </section>

        <section aria-labelledby="write-heading" className="lg:col-span-7 mt-14 lg:mt-0">
          <h2 id="write-heading" className="font-display font-extrabold text-ink text-[28px] md:text-4xl">
            Write to us
          </h2>
          <p className="mt-2 text-[16px] text-ink/70">
            Your message opens in WhatsApp or your email app, ready to send.
          </p>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              send('whatsapp');
            }}
            className="mt-6 grid gap-5"
          >
            <Field id="contact-name" label="Your name" optional>
              {(props) => (
                <input {...props} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              )}
            </Field>
            <Field id="contact-topic" label="What's it about?">
              {(props) => (
                <select {...props} value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field
              id="contact-message"
              label="Message"
              multiline
              error={showError && !message.trim() ? 'Write your message first.' : undefined}
            >
              {(props) => (
                <textarea
                  {...props}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="If it's about an order, include your order number."
                />
              )}
            </Field>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-full bg-[#25D366] text-ink font-semibold hover:brightness-95 transition-[filter]"
              >
                <MessageCircle className="w-[18px] h-[18px]" aria-hidden />
                Send on WhatsApp
              </button>
              <button
                type="button"
                onClick={() => send('email')}
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-full border border-ink/15 text-ink font-semibold hover:bg-white transition-colors"
              >
                <Mail className="w-[18px] h-[18px]" aria-hidden />
                Send by email
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <li className="border-b border-ink/10">
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex items-start gap-4 py-5"
      >
        <span aria-hidden className="shrink-0 w-11 h-11 rounded-full bg-white text-primary-600 grid place-items-center">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm text-ink/70">{label}</span>
          <span className="block mt-0.5 text-[17px] font-semibold text-ink group-hover:text-primary-700 transition-colors break-words">
            {value}
          </span>
        </span>
      </a>
    </li>
  );
}
