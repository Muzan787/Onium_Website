import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate sending (In a real app, you'd send this to Supabase or EmailJS)
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6 text-primary-500" />,
      title: "Phone & WhatsApp",
      value: "+92 323 1550147",
      link: "https://wa.me/923231550147",
      action: "Chat now"
    },
    {
      icon: <Mail className="w-6 h-6 text-secondary-500" />,
      title: "Email Us",
      value: "support@onium.store",
      link: "mailto:support@onium.store",
      action: "Send email"
    },
    {
      icon: <MapPin className="w-6 h-6 text-accent-500" />,
      title: "Location",
      value: "Islamabad, Pakistan",
      link: "#",
      action: "View map"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <SEO title="Contact Us" description="Get in touch with Onium regarding orders, products, or wholesale inquiries." />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Get in Touch</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Have questions about our products or your order? We're here to help. Reach out to us via WhatsApp, email, or the form below.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4 lg:col-span-1">
            {contactInfo.map((info, idx) => (
              <a 
                key={idx} 
                href={info.link}
                target={info.link.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="block bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary-50 transition-colors">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{info.title}</h3>
                    <p className="text-slate-600 font-medium mb-2">{info.value}</p>
                    <span className="text-xs font-bold text-primary-600 flex items-center gap-1">
                      {info.action} <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </a>
            ))}

            {/* Quick WhatsApp Box */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg mt-8">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" /> Quick Support
              </h3>
              <p className="text-green-50 text-sm mb-4">
                Need an immediate response? Our WhatsApp support is active 9 AM - 9 PM daily.
              </p>
              <a 
                href="https://wa.me/923231550147" 
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-2.5 bg-white text-green-600 rounded-xl text-center font-bold hover:bg-green-50 transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="Order Status">Order Status Inquiry</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Bulk Order">Bulk Order Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea 
                    required 
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                    placeholder="How can we help you today?"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}