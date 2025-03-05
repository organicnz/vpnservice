"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import supabase from '@/lib/supabase';

// Icons (simplified with emoji for brevity)
const Icons = {
  Dashboard: '📊',
  Users: '👥',
  Plans: '📋',
  Servers: '🖥️',
  Settings: '⚙️',
  Logout: '🚪',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Icons.Dashboard },
    { name: 'Users', href: '/dashboard/users', icon: Icons.Users },
    { name: 'Plans', href: '/dashboard/plans', icon: Icons.Plans },
    { name: 'Servers', href: '/dashboard/servers', icon: Icons.Servers },
    { name: 'Settings', href: '/dashboard/settings', icon: Icons.Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-10 p-4 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <h1 className="text-xl font-bold">VPN Admin</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-white w-64 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-20 shadow-lg`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-primary-700">VPN Admin</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center p-3 rounded-lg text-gray-700 ${
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <span className="mr-3">{Icons.Logout}</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className={`lg:ml-64 pt-4 lg:pt-0 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 