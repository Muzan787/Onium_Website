import { Truck, MapPin, Clock, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <SEO title="Shipping Policy" description="Shipping information, delivery areas, and timelines for Onium Store." />
      
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-primary-100 text-primary-600 rounded-full mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Shipping Policy</h1>
          <p className="text-slate-500 text-lg">
            Transparent and reliable delivery to your doorstep.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Important Notice Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <MapPin className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Service Area Restriction</h3>
              <p className="text-yellow-800 text-sm leading-relaxed">
                Currently, <strong>we strictly offer shipping within Islamabad only</strong>. 
                We are a growing business and plan to expand our delivery network to Rawalpindi and other major cities very soon. 
                Stay tuned for updates!
              </p>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Delivery Timing */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <h2 className="text-xl font-bold text-slate-900">Delivery Timelines</h2>
                </div>
                <div className="prose text-slate-600 text-sm md:text-base">
                  <p className="mb-3">
                    Since we operate locally within Islamabad, we pride ourselves on fast delivery.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Standard Delivery:</strong> 24 to 48 hours.</li>
                    <li><strong>Same-Day Delivery:</strong> Orders placed before 12:00 PM are often delivered the same day (subject to rider availability).</li>
                    <li><strong>Sundays & Holidays:</strong> Orders placed on weekends will be processed the next working day.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Shipping Costs */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-5 h-5 text-secondary-500" />
                  <h2 className="text-xl font-bold text-slate-900">Shipping Costs</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-1">Standard Rate</h4>
                    <p className="text-slate-500 text-sm">Rs 200 flat rate for all orders under Rs 3,000.</p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                    <h4 className="font-bold text-primary-700 mb-1">Free Shipping</h4>
                    <p className="text-primary-600 text-sm">Free delivery for all orders above Rs 3,000.</p>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Damaged Items */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-bold text-slate-900">Damaged or Incorrect Items</h2>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  While we take great care in packaging, accidents can happen. If you receive a leaking bottle or the wrong product, please:
                </p>
                <ol className="list-decimal pl-5 mt-3 space-y-2 text-slate-600 text-sm">
                  <li>Take a clear photo of the damaged/incorrect item immediately upon arrival.</li>
                  <li>Send the photo to our WhatsApp support at <strong>+92 323 1550147</strong> within 24 hours.</li>
                  <li>We will dispatch a replacement free of charge or process a refund.</li>
                </ol>
              </section>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}