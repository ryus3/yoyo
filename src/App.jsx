import React from 'react';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                RYUS - نظام إدارة المخزون
              </h1>
              <p className="text-lg text-gray-600">
                مرحباً بك في نظام إدارة المخزون المتطور
              </p>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;