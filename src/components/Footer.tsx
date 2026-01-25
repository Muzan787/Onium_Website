import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                O
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Onium</span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Premium eco-friendly cleaning solutions for a safer, sparklier home. 
              Join the cleaning revolution today.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="hover:text-primary-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Home</Link></li>
              <li><Link to="/products" className="hover:text-primary-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Shop All</Link></li>
              <li><Link to="/about" className="hover:text-primary-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" /> About Us</Link></li>
              <li><Link to="/track-order" className="hover:text-primary-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Track Order</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Customer Care</h3>
            <ul className="space-y-4">
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-400 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-primary-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                <span>HM Towers, Office 402, 5th Floor, Gulberg Green, Islamabad</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>+92 323 1550147</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>rabta@onium.store</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Onium Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}