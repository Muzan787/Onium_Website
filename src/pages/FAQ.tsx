import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, HelpCircle, ShieldCheck, Truck } from 'lucide-react';
import SEO from '../components/SEO';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Are Onium products safe for pets and children?",
      answer: "Absolutely. All our formulas are 100% non-toxic, biodegradable, and free from harsh chemicals like bleach and ammonia. We design them specifically to be safe for homes with curious kids and furry friends."
    },
    {
      question: "How long does delivery take?",
      answer: "We strive to deliver quickly! We currently deliver in Islamabad and Rawalpindi only, and orders usually arrive within 1-3 business days. Orders placed before 2 PM are usually dispatched the same day."
    },
    {
      question: "Do you offer Pay on Delivery?",
      answer: "Yes. You can pay when the rider arrives at your doorstep. Online payment by transfer is preferred over cash, and we deliver in Islamabad and Rawalpindi."
    },
    {
      question: "What is your return policy?",
      answer: "We have a 7-day 'No Questions Asked' return policy for damaged or incorrect items. If you're not satisfied with the cleaning power, contact us on WhatsApp, and we'll make it right."
    },
    {
      question: "Do you offer discounts for bulk orders?",
      answer: "Yes! For hospitals, offices, or large households, we offer special wholesale pricing. Please use the 'Bulk Order' button on the home page or contact us directly via WhatsApp."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you can use the 'Track Order' link in the menu. Simply enter the Order ID provided in your confirmation email (e.g., #12AB34CD) to see live status updates."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <SEO title="FAQ" description="Frequently Asked Questions about Onium cleaning products, shipping, and returns." />
      
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-primary-100 text-primary-600 rounded-2xl mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-500 text-lg">Everything you need to know about our products and services.</p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                openIndex === index ? 'border-primary-500 shadow-md ring-1 ring-primary-100' : 'border-slate-200 hover:border-primary-200'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 focus:outline-none"
              >
                <span>{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-slate-600 leading-relaxed border-t border-dashed border-slate-100 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div className="mt-12 bg-slate-900 rounded-3xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
            <p className="text-slate-400 mb-6">Can't find the answer you're looking for? Chat with our friendly team.</p>
            <a 
              href="https://wa.me/923231550147" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-900/50"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}