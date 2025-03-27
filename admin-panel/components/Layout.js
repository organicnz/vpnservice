import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase, getUserRole } from '../lib/supabase';
import { FiHome, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiKey, FiUser } from 'react-icons/fi';

export default function Layout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState('anonymous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      
      try {
        const { role } = await getUserRole();
        setUserRole(role);
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Define navigation links based on user role
  const adminNavLinks = [
    { href: '/', label: 'Dashboard', icon: FiHome },
    { href: '/clients', label: 'Clients', icon: FiUsers },
    { href: '/settings', label: 'Settings', icon: FiSettings },
  ];

  const clientNavLinks = [
    { href: '/connect', icon: FiKey, text: 'Connect VPN' },
    { href: '/profile', icon: FiUser, text: 'Profile' },
  ];

  // Select the appropriate navigation links based on user role
  const navLinks = userRole === 'admin' ? adminNavLinks : clientNavLinks;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/* Sidebar overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 transition-opacity"
              onClick={toggleSidebar}
            >
              <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
            </div>
          )}
          
          {/* Sidebar */}
          <div 
            className={`${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed inset-y-0 left-0 w-64 transition duration-300 transform bg-white shadow-lg`}
          >
            <div className="flex items-center justify-between h-16 px-4">
              <div className="text-xl font-semibold text-gray-800">
                VPN Service
              </div>
              <button
                className="text-gray-500 focus:outline-none focus:text-gray-700"
                onClick={toggleSidebar}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-2 py-4">
              <nav>
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    passHref
                    legacyBehavior
                  >
                    <a 
                      className={`${
                        router.pathname === link.href
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      } flex items-center px-4 py-2 rounded-md transition-colors duration-200`}
                    >
                      {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                      {link.label}
                    </a>
                  </Link>
                ))}
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 mt-4 text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <FiLogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center px-4">
              <div className="text-xl font-semibold text-gray-800">
                VPN Service
              </div>
            </div>
            
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    passHref
                    legacyBehavior
                  >
                    <a 
                      className={`${
                        router.pathname === link.href
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      } group flex items-center px-4 py-2 rounded-md transition-colors duration-200`}
                    >
                      {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                      {link.label}
                    </a>
                  </Link>
                ))}
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 mt-4 text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <FiLogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="lg:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600"
            onClick={toggleSidebar}
          >
            <FiMenu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex-1">
              {/* Page title can go here if needed */}
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* User profile dropdown can go here */}
              <div className="text-sm text-gray-500">
                {userRole === 'admin' ? 'Admin User' : 'Client User'}
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
} 