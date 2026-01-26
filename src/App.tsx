import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import WelcomePopup from './components/WelcomePopup.tsx';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext'; // Keep this if you plan to add Customer Login later

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Reviews from './pages/Reviews';
import About from './pages/About';
import TrackOrder from './pages/TrackOrder';
import FAQ from './pages/FAQ'; 
import Contact from './pages/Contact'; 
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop /> 
      
      {/* Keep AuthProvider if you want Customer Login features. 
         If your store is Guest Checkout only, you can remove <AuthProvider> wrapper 
         and delete src/context/AuthContext.tsx to save more space.
      */}
      <AuthProvider>
        <CartProvider>
            <Toaster 
              position="top-center" 
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '10px',
                },
                success: {
                  style: { background: '#10b981' },
                  iconTheme: { primary: '#fff', secondary: '#10b981' },
                },
                error: {
                  style: { background: '#ef4444' },
                  iconTheme: { primary: '#fff', secondary: '#ef4444' },
                },
              }}
            />
            <WelcomePopup />
            
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} /> 
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/return-policy" element={<ReturnPolicy />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    {/* 404 - Redirect unknown routes to Home */}
                    <Route path="*" element={<Home />} />
                  </Routes>
                </main>
                <Footer />
            </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;