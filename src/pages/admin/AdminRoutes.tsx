import { Routes, Route, Navigate } from 'react-router-dom';

import { AdminAuthProvider } from '../../context/AdminAuthContext';
import SEO from '../../components/SEO';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute';

import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import AdminProducts from './AdminProducts';
import AdminDeals from './AdminDeals';
import AdminOrders from './AdminOrders';
import AdminReviews from './AdminReviews';
import AdminCustomers from './AdminCustomers';

/**
 * The admin panel (formerly the separate admin-onium app).
 *
 * This module is lazy-loaded from App.tsx so none of it — including the rich
 * text editor — ships in the bundle shoppers download. It keeps its own auth
 * context, which checks the session against the 'admins' whitelist, and stays
 * out of the storefront chrome and the search index.
 */
export default function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <SEO title="Admin" noIndex />
      <Routes>
        <Route path="login" element={<AdminLogin />} />

        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        {/* Unknown admin pages go back to the dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
