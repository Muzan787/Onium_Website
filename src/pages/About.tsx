import { ShieldCheck, Truck, Clock, Award } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  const features = [
    { icon: <ShieldCheck className="w-8 h-8 text-primary-500" />, title: "Secure Shopping", desc: "Industry-standard encryption to protect your data." },
    { icon: <Truck className="w-8 h-8 text-secondary-500" />, title: "Fast Delivery", desc: "Reliable shipping to get your products to you quickly." },
    { icon: <Clock className="w-8 h-8 text-accent-500" />, title: "24/7 Support", desc: "Our team is always here to help via WhatsApp." },
    { icon: <Award className="w-8 h-8 text-primary-500" />, title: "Quality Guaranteed", desc: "Premium formulas that actually work." }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title="About Us" description="Learn more about Onium's mission to provide eco-friendly cleaning solutions." />
      <div className="bg-slate-900 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Onium</h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">Redefining home hygiene with eco-friendly, powerful cleaning solutions.</p>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-4">Onium was founded to bridge the gap between powerful industrial cleaning and safe, home-friendly products. We believe you shouldn't have to choose between a clean home and a safe environment.</p>
            <p className="text-slate-600 leading-relaxed">Our formulas are biodegradable, non-toxic, and highly effective against stubborn stains.</p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img src="https://images.pexels.com/photos/48604/pexels-photo-48604.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Clean Home" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}