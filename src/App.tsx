import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
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

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminDeals from './pages/admin/AdminDeals';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/admin/AdminReviews';

function App() {
  return (
    <BrowserRouter>
      {/* ADD SCROLL TO TOP HERE */}
      <ScrollToTop /> 
      
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
            
            <div className="flex flex-col min-h-screen">
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} /> {/* Updated */}
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="deals" element={<AdminDeals />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>

                {/* Public Routes */}
                <Route
                  path="/*"
                  element={
                    <>
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
                        </Routes>
                      </main>
                      <Footer />
                    </>
                  }
                />
              </Routes>
            </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;