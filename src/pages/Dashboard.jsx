import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">إجمالي المنتجات</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">الطلبات المعلقة</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">المبيعات اليوم</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0 د.ع</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">المخزون المنخفض</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">0</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">مرحباً بك في نظام RYUS</h2>
        <p className="text-gray-600">
          هذا هو نظام إدارة المخزون المتطور. يمكنك البدء بإضافة المنتجات وإدارة الطلبات.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;