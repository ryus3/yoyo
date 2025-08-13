import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster.jsx';
import { toast } from '@/hooks/use-toast';

import { useAuth } from '@/contexts/UnifiedAuthContext.jsx';
import { usePermissions } from '@/hooks/usePermissions.js';
import Layout from '@/components/Layout.jsx';
import Loader from '@/components/ui/loader.jsx';
import { useAiChat } from './contexts/AiChatContext';
import AiChatDialog from './components/ai/AiChatDialog';
import NotificationsHandler from './contexts/NotificationsHandler';

import { scrollToTopInstant } from '@/utils/scrollToTop';

const LoginPage = lazy(() => import('@/pages/LoginPage.jsx'));
const Dashboard = lazy(() => import('@/pages/Dashboard.jsx'));

// Placeholder components for missing pages
const PlaceholderPage = ({ title }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
    <p className="text-gray-600">هذه الصفحة قيد التطوير</p>
  </div>
);

function ProtectedRoute({ children, permission }) {
  const { user, loading } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background"><Loader /></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === 'pending') {
    return <Navigate to="/login" replace />;
  }

  if (permissionsLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background"><Loader /></div>;
  }

  if (permission) {
    const requested = Array.isArray(permission) ? permission : [permission];
    const allowedByPerms = requested.some((p) => hasPermission(p));
    const allowedByFlag = requested.some((p) => ['view_customers','manage_all_customers'].includes(p)) && (user?.customer_management_access === true);
    const allowed = allowedByPerms || allowedByFlag;
    if (!allowed) {
      return <Navigate to={(user && (user.defaultPage || user.default_page)) || '/'} replace />;
    }
  }
  
  return children;
}

function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    scrollToTopInstant();
  }, [location.pathname]);
  
  return null;
}

function AppContent() {
  const { user, loading } = useAuth();
  const { aiChatOpen, setAiChatOpen } = useAiChat();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background"><Loader /></div>;
  }

  const childrenWithProps = (Component, props = {}) => (
    <Layout>
      <Component {...props} />
    </Layout>
  );

  return (
    <div className="h-dvh bg-background text-foreground">
       <Helmet>
        <title>RYUS | نظام إدارة المخزون والطلبات</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </Helmet>
      <ScrollToTop />
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-background"><Loader /></div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute>{user?.defaultPage && user.defaultPage !== '/' ? <Navigate to={user.defaultPage} replace /> : childrenWithProps(Dashboard)}</ProtectedRoute>} />
          
          {/* Placeholder routes for missing pages */}
          <Route path="/quick-order" element={<ProtectedRoute permission="quick_order">{childrenWithProps(() => <PlaceholderPage title="الطلب السريع" />)}</ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute permission="view_products">{childrenWithProps(() => <PlaceholderPage title="المنتجات" />)}</ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute permission="view_inventory">{childrenWithProps(() => <PlaceholderPage title="المخزون" />)}</ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute permission="view_orders">{childrenWithProps(() => <PlaceholderPage title="طلباتي" />)}</ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute permission="view_settings">{childrenWithProps(() => <PlaceholderPage title="الإعدادات" />)}</ProtectedRoute>} />
        </Routes>
      </Suspense>
      <Toaster />
      <AiChatDialog open={aiChatOpen} onOpenChange={setAiChatOpen} />
      {user && <NotificationsHandler />}
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <AppContent />
    </HelmetProvider>
  );
}

export default App;