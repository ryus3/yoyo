import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل المستخدم
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // محاكاة تسجيل الدخول
      const mockUser = {
        id: '1',
        email: credentials.email,
        username: credentials.username || 'user',
        full_name: 'مستخدم تجريبي',
        role: 'admin',
        status: 'active',
        defaultPage: '/',
        customer_management_access: true
      };
      setUser(mockUser);
      return { user: mockUser };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};