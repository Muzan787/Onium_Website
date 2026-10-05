import { Link } from 'react-router-dom';
import { MapPin, Mail, MessageCircle } from 'lucide-react';
import { ACCENTS } from '../lib/productAccents';
import { ADDRESS, EMAIL, PHONE_DISPLAY, PHONE_HREF, WHATSAPP_URL } from '../lib/contact';

const LOGO = 'https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png';

const SHOP = [
  { label: 'All products', to: '/', hash: '#products' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Track your order', to: '/track-order' },
  { label: 'About Onium', to: '/about' },
];

const HELP = [
  { label: 'Contact us', to: '/contact' },
  { label: 'Shipping policy', to: '/shipping-policy' },
  { label: 'Returns & refunds', to: '/return-policy' },
  { label: 'FAQs', to: '/faq' },
];

/** The range, left to right, as the footer's signature. */
const STRIPE = [ACCENTS.gold.solid, ACCENTS.clay.solid, ACCENTS.teal.solid, ACCENTS.cyan.solid, ACCENTS.blue.solid];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div aria-hidden className="flex h-1.5">
        {STRIPE.map((color) => (
          <span key={color} className="flex-1" style={{ backgroundColor: color }} />
        ))}
      </div>

      <div className="container mx-auto px-4 pt-12 pb-8 md:pt-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">

          {/* WhatsApp is where most orders actually happen, so the page ends
              by handing people to it. */}
          <div className="md:col-span-5">
            <h2 className="font-display font-extrabold text-white text-[30px] md:text-4xl leading-tight">
              Questions? Message us.
            </h2>
            <p className="mt-2 text-[15px] text-white/75">
              Orders, bulk quotes and delivery questions, all on WhatsApp.
            </p>
            {/* Ink on the bright WhatsApp green is 8.6:1; white on it is 3.1:1,
                which fails for text this size. */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex md:inline-flex w-full md:w-auto items-center justify-center gap-2 min-h-[52px] px-7 rounded-full bg-[#25D366] text-ink font-semibold hover:brightness-95 active:scale-95 transition-[filter,transform]"
            >
              <MessageCircle className="w-[18px] h-[18px]" aria-hidden />
              Chat on WhatsApp
            </a>
            <div>
              <a
                href={PHONE_HREF}
                className="mt-2 inline-flex min-h-11 items-center text-sm text-white/70 hover:text-white tabular transition-colors"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="md:col-span-7 border-t border-white/10 pt-10 md:border-t-0 md:pt-0">
            <img src={LOGO} alt="Onium" width={82} height={36} className="h-9 w-auto object-contain" />
            <p className="mt-3 text-sm leading-relaxed max-w-xs">
              Everyday cleaning products made in Pakistan, without the harsh chemicals.
            </p>

            {/* Side by side even on a phone; stacked, they doubled the footer's length. */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <nav aria-label="Shop">
                <h3 className="font-display font-bold text-white text-sm mb-1">Shop</h3>
                <ul className="text-sm">
                  {SHOP.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={{ pathname: item.to, hash: item.hash }}
                        className="flex items-center min-h-10 hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="Help">
                <h3 className="font-display font-bold text-white text-sm mb-1">Help</h3>
                <ul className="text-sm">
                  {HELP.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to} className="flex items-center min-h-10 hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-leaf-500 shrink-0 mt-0.5" aria-hidden />
                <span>{ADDRESS}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-leaf-500 shrink-0" aria-hidden />
                <a href={`mailto:${EMAIL}`} className="hover:text-white transition-colors break-all">
                  {EMAIL}
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
