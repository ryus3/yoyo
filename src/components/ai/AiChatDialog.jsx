import React from 'react';

const AiChatDialog = ({ open, onOpenChange }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">مساعد الذكاء الاصطناعي</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <div className="text-center text-gray-500">
            <p>مساعد الذكاء الاصطناعي قيد التطوير</p>
            <p className="text-sm mt-2">سيتم إضافة هذه الميزة قريباً</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatDialog;