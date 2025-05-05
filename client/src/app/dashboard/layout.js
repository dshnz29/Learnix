// app/dashboard/layout.js
'use client';

import Sidebar from '../../components/SideBar';
import React from 'react';


export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
