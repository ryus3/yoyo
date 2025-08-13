import { useState, useCallback } from 'react';

let toastId = 0;

export const toast = (options) => {
  const id = ++toastId;
  
  // Create toast element
  const toastElement = document.createElement('div');
  toastElement.className = `
    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
    rounded-lg shadow-lg p-4 mb-2 max-w-sm w-full
    transform transition-all duration-300 ease-in-out
    translate-x-full opacity-0
  `;
  
  toastElement.innerHTML = `
    <div class="flex items-start">
      <div class="flex-1">
        ${options.title ? `<div class="font-semibold text-gray-900 dark:text-gray-100">${options.title}</div>` : ''}
        ${options.description ? `<div class="text-gray-600 dark:text-gray-300 text-sm">${options.description}</div>` : ''}
      </div>
      <button class="ml-2 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
        ×
      </button>
    </div>
  `;
  
  // Add to container
  const container = document.getElementById('toast-container') || document.body;
  container.appendChild(toastElement);
  
  // Animate in
  setTimeout(() => {
    toastElement.classList.remove('translate-x-full', 'opacity-0');
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toastElement.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
      }
    }, 300);
  }, options.duration || 5000);
  
  return id;
};

export const useToast = () => {
  return { toast };
};