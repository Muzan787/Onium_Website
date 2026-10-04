import { Outlet } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import WelcomePopup from './WelcomePopup';

export default function StorefrontLayout() {
  return (
    <>
      <WelcomePopup />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
