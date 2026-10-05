import { ReactNode, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import { WHATSAPP_URL, whatsappWith } from '../lib/contact';

const LINK = 'font-semibold text-primary-700 underline underline-offset-2';

const FAQS: { question: string; answer: ReactNode }[] = [
  {
    question: 'Are Onium products safe for pets and children?',
    answer:
      'Absolutely. All our formulas are 100% non-toxic, biodegradable, and free from harsh chemicals like bleach and ammonia. We design them specifically to be safe for homes with curious kids and furry friends.',
  },
  {
    question: 'How long does delivery take?',
    answer: (
      <>
        We deliver in Islamabad and Rawalpindi only for now, and orders usually arrive within 1 to 3 business days.
        Orders placed before 2 PM are usually dispatched the same day. More in our{' '}
        <Link to="/shipping-policy" className={LINK}>
          shipping policy
        </Link>
        .
      </>
    ),
  },
  {
    question: 'Do you offer pay on delivery?',
    answer:
      'Yes. You pay when the rider arrives at your door. Online payment by transfer is preferred over cash.',
  },
  {
    question: 'What is your return policy?',
    answer: (
      <>
        We have a 7-day "no questions asked" return policy for damaged or incorrect items. If you're not satisfied
        with the cleaning power, message us on WhatsApp and we'll make it right. See the{' '}
        <Link to="/return-policy" className={LINK}>
          returns policy
        </Link>
        .
      </>
    ),
  },
  {
    question: 'Do you offer discounts for bulk orders?',
    answer: (
      <>
        Yes. For hospitals, offices and large households we offer wholesale pricing.{' '}
        <a
          href={whatsappWith("I'm interested in a bulk order for my business.")}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK}
        >
          Ask for bulk pricing on WhatsApp
        </a>
        .
      </>
    ),
  },
  {
    question: 'How can I track my order?',
    answer: (
      <>
        Use{' '}
        <Link to="/track-order" className={LINK}>
          Track order
        </Link>{' '}
        with the order number from your confirmation, for example #12AB34CD.
      </>
    ),
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();
  const baseId = useId();

  return (
    <div>
      <SEO title="FAQ" description="Answers about Onium products, delivery, payment and returns." />
      <PageIntro
        title="Questions, answered"
        lede={
          <>
            Can't find yours?{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-4">
              Ask us on WhatsApp
            </a>
            .
          </>
        }
      />

      <div className="container mx-auto px-4 py-10 md:py-16">
        <ul className="max-w-3xl border-t border-ink/10">
          {FAQS.map(({ question, answer }, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            return (
              <li key={question} className="border-b border-ink/10">
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full flex items-start justify-between gap-6 py-6 text-left font-display font-bold text-ink text-xl md:text-2xl tracking-tight"
                  >
                    {question}
                    <span
                      aria-hidden
                      className={`mt-0.5 shrink-0 w-9 h-9 rounded-full grid place-items-center transition-[transform,background-color] duration-300 ${
                        isOpen ? 'rotate-45 bg-primary-600 text-white' : 'bg-white text-ink'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </span>
                  </button>
                </h2>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-7 pr-12 max-w-prose text-[17px] leading-relaxed text-ink/80">{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
