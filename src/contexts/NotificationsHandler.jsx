import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const NotificationsHandler = () => {
  useEffect(() => {
    // محاكاة نظام الإشعارات
    const interval = setInterval(() => {
      // يمكن إضافة منطق الإشعارات هنا لاحقاً
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default NotificationsHandler;