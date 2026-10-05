import { Outlet } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import WelcomePopup from './WelcomePopup';

export default function StorefrontLayout() {
  return (
    <>
      <WelcomePopup />
      <div className="flex flex-col min-h-screen">
        {/* First stop for keyboard users: jump past the header to the page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-ink focus:px-4 focus:py-2.5 focus:rounded-full focus:shadow-lg focus:font-semibold"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-grow focus:outline-none">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
