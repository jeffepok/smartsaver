'use client';

import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            SmartSave
            <span className="block text-xl font-normal text-gray-600 mt-1">Financial Assistant</span>
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
