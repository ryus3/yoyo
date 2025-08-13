import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext.jsx';

export const usePermissions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (user) {
      // محاكاة تحميل الصلاحيات
      setTimeout(() => {
        const mockPermissions = [
          'view_dashboard',
          'view_products',
          'manage_products',
          'view_inventory',
          'manage_inventory',
          'view_orders',
          'create_orders',
          'quick_order',
          'view_purchases',
          'view_settings',
          'view_own_profits',
          'view_accounting',
          'manage_employees',
          'view_customers',
          'manage_all_customers',
          'view_all_orders',
          'manage_variants'
        ];
        setPermissions(mockPermissions);
        setLoading(false);
      }, 500);
    } else {
      setPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.includes(permission);
  };

  return {
    permissions,
    loading,
    hasPermission
  };
};