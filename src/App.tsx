import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Vendor Pages
import VendorDashboard from './pages/Vendor/VendorDashboard';
import VendorShop from './pages/Vendor/VendorShop';
import VendorOrders from './pages/Vendor/VendorOrders';
import VendorInventory from './pages/Vendor/VendorInventory';
import VendorCheckout from './pages/Vendor/VendorCheckout';
import VendorProfile from './pages/Vendor/VendorProfile';

// Supplier Pages
import SupplierDashboard from './pages/Supplier/SupplierDashboard';
import SupplierOrders from './pages/Supplier/SupplierOrders';
import SupplierProducts from './pages/Supplier/SupplierProducts';
import SupplierCustomers from './pages/Supplier/SupplierCustomers';
import SupplierProfile from './pages/Supplier/SupplierProfile';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Vendor Routes */}
              <Route 
                path="/vendor/dashboard" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/shop" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorShop />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/orders" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/inventory" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorInventory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/checkout" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorCheckout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/profile" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Supplier Routes */}
              <Route 
                path="/supplier/dashboard" 
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplierDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/supplier/orders" 
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplierOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/supplier/products" 
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplierProducts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/supplier/customers" 
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplierCustomers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/supplier/profile" 
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplierProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default Redirect */}
              <Route path="/" element={<>Hello</>} />
            </Routes>
          </Layout>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#1E293B',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;