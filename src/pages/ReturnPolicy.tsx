import { RefreshCw, CheckCircle, AlertCircle, DollarSign, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <SEO title="Return & Refund Policy" description="Our 7-day No Questions Asked return policy and refund process." />
      
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full mb-4">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Return & Refund Policy</h1>
          <p className="text-slate-500 text-lg">
            We want you to love our products. If you don't, we're here to help.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Main Guarantee Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7-Day "No Questions Asked" Guarantee</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              We stand by the quality of our cleaning solutions. If you receive a damaged product, the wrong item, or are simply not satisfied with the cleaning results, you can return it within <strong>7 days of delivery</strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-700">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" /> Easy Returns
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" /> Full Refund
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" /> Fast Processing
              </div>
            </div>
          </div>

          {/* Policy Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Eligibility */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-primary-500" />
                  <h3 className="text-xl font-bold text-slate-900">Eligibility for Returns</h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm md:text-base">
                  <li>Item must be initiated for return within 7 days of delivery.</li>
                  <li><strong>For Damaged/Leaking Items:</strong> Please provide a photo as proof.</li>
                  <li><strong>For "Change of Mind":</strong> The product must be unused, sealed, and in its original packaging.</li>
                  <li><strong>For Performance Issues:</strong> If you used the product and it didn't work as expected, contact us for a consultation or refund.</li>
                </ul>
              </section>

              <hr className="border-slate-100" />

              {/* How to Return */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-secondary-500" />
                  <h3 className="text-xl font-bold text-slate-900">How to Initiate a Return</h3>
                </div>
                <p className="text-slate-600 mb-4 text-sm md:text-base">
                  We make it simple. No complex forms to fill out.
                </p>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <ol className="list-decimal pl-5 space-y-3 text-slate-700 font-medium">
                    <li>Message us on WhatsApp at <strong>+92 323 1550147</strong>.</li>
                    <li>Share your Order ID (e.g., #12AB34CD) and reason for return.</li>
                    <li>If the item is damaged, please attach a photo.</li>
                    <li>Our team will approve the return and guide you on the next steps.</li>
                  </ol>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Refund Process */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-bold text-slate-900">Refund Methods</h3>
                </div>
                <p className="text-slate-600 text-sm md:text-base mb-3">
                  Once we receive your return (or photo proof for damaged items), we process refunds within <strong>24-48 hours</strong>.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-1">Bank Transfer</h4>
                    <p className="text-slate-500 text-sm">Directly to your Meezan, HBL, or standard bank account.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-1">Mobile Wallets</h4>
                    <p className="text-slate-500 text-sm">EasyPaisa or JazzCash for instant transfer.</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
          
          {/* Note on Return Shipping */}
          <div className="text-center text-slate-400 text-sm px-4">
            <p>* For "Change of Mind" returns, the customer is responsible for return shipping costs. <br/>For damaged/incorrect items, we cover all costs.</p>
          </div>

        </div>
      </div>
    </div>
  );
}