import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';

const LOGO = 'https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png';

const SHOP = [
  { label: 'All products', href: '/#products' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Track your order', href: '/track-order' },
  { label: 'About Onium', href: '/about' },
];

const HELP = [
  { label: 'Contact us', href: '/contact' },
  { label: 'Shipping policy', href: '/shipping-policy' },
  { label: 'Returns & refunds', href: '/return-policy' },
  { label: 'FAQs', href: '/faq' },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="container mx-auto px-4 pt-14 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

          <div className="lg:col-span-1">
            <img src={LOGO} alt="Onium" width={82} height={36} className="h-9 w-auto object-contain" />
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              Everyday cleaning products made in Pakistan, without the harsh chemicals.
            </p>
            <div className="flex gap-2 mt-5">
              <a
                href="#"
                aria-label="Onium on Facebook"
                className="w-10 h-10 rounded-full bg-white/10 grid place-items-center hover:bg-primary-600 hover:text-white transition-colors"
              >
                <Facebook className="w-[18px] h-[18px]" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="Onium on Instagram"
                className="w-10 h-10 rounded-full bg-white/10 grid place-items-center hover:bg-primary-600 hover:text-white transition-colors"
              >
                <Instagram className="w-[18px] h-[18px]" aria-hidden />
              </a>
            </div>
          </div>

          <nav aria-label="Shop">
            <h2 className="font-display font-bold text-white text-sm mb-4">Shop</h2>
            <ul className="space-y-1 text-sm">
              {SHOP.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="inline-block py-1.5 hover:text-white transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <h2 className="font-display font-bold text-white text-sm mb-4">Help</h2>
            <ul className="space-y-1 text-sm">
              {HELP.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="inline-block py-1.5 hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display font-bold text-white text-sm mb-4">Get in touch</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-leaf-500 shrink-0 mt-0.5" aria-hidden />
                <span>HM Towers, Office 402, 5th Floor, Gulberg Green, Islamabad</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-leaf-500 shrink-0" aria-hidden />
                <a href="tel:+923231550147" className="hover:text-white transition-colors tabular">
                  +92 323 1550147
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-leaf-500 shrink-0" aria-hidden />
                <a href="mailto:rabta@onium.store" className="hover:text-white transition-colors break-all">
                  rabta@onium.store
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-white/60">
          <p>&copy; {new Date().getFullYear()} Onium Store</p>
          <p>Delivering in Islamabad &amp; Rawalpindi</p>
        </div>
      </div>
    </footer>
  );
}
