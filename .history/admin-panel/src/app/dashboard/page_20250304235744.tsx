"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase';

// Mark the page as dynamic to prevent static generation during build
export const dynamic = 'force-dynamic';

// Example dashboard widgets
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    servers: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch statistics from Supabase
        // Replace with actual database queries
        const { data: users } = await supabase.from('users').select('*');
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('status', 'active');
        const { data: servers } = await supabase.from('servers').select('*');
          
        // Only update stats if we have valid data (not in SSG)
        if (users !== null && subscriptions !== null && servers !== null) {
          setStats({
            totalUsers: users.length || 0,
            activeSubscriptions: subscriptions.length || 0,
            servers: servers.length || 0,
            revenueThisMonth: calculateRevenue(subscriptions || []),
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // For demo, use placeholder data if error
        setStats({
          totalUsers: 256,
          activeSubscriptions: 187,
          servers: 12,
          revenueThisMonth: 4275.50,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to calculate revenue
  const calculateRevenue = (subscriptions: any[] = []) => {
    return subscriptions.reduce((total, sub) => total + (sub.amount || 0), 0);
  };

  if (loading) {
    return <div className="flex justify-center p-12">Loading dashboard data...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your VPN subscription admin panel.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          trend={+8.2} 
          link="/dashboard/users"
        />
        <StatCard 
          title="Active Subscriptions" 
          value={stats.activeSubscriptions} 
          trend={+12.4} 
          link="/dashboard/subscriptions"
        />
        <StatCard 
          title="Servers" 
          value={stats.servers} 
          trend={0} 
          link="/dashboard/servers"
        />
        <StatCard 
          title="Revenue (This Month)" 
          value={`$${stats.revenueThisMonth.toFixed(2)}`} 
          trend={+15.3} 
          link="/dashboard/revenue"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Signups</h2>
          <ul className="divide-y">
            <RecentActivityItem 
              title="John Doe"
              subtitle="Basic Plan"
              date="Today, 10:45 AM"
            />
            <RecentActivityItem 
              title="Jane Smith"
              subtitle="Premium Plan"
              date="Yesterday, 3:20 PM"
            />
            <RecentActivityItem 
              title="Michael Johnson"
              subtitle="Pro Plan"
              date="Yesterday, 1:30 PM"
            />
          </ul>
          <div className="mt-4">
            <Link href="/dashboard/users" className="text-primary-600 hover:underline">
              View all users →
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Server Status</h2>
          <ul className="divide-y">
            <ServerStatusItem 
              name="US East"
              status="Online"
              load={42}
            />
            <ServerStatusItem 
              name="Europe West"
              status="Online"
              load={78}
            />
            <ServerStatusItem 
              name="Asia Pacific"
              status="Maintenance"
              load={0}
            />
          </ul>
          <div className="mt-4">
            <Link href="/dashboard/servers" className="text-primary-600 hover:underline">
              View all servers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for stat cards
const StatCard = ({ title, value, trend, link }: any) => (
  <div className="card">
    <h3 className="text-gray-500 font-medium">{title}</h3>
    <div className="flex items-end justify-between mt-2">
      <p className="text-3xl font-bold">{value}</p>
      {trend !== null && (
        <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </p>
      )}
    </div>
    <div className="mt-4">
      <Link href={link} className="text-primary-600 text-sm hover:underline">
        View Details →
      </Link>
    </div>
  </div>
);

// Component for recent activity items
const RecentActivityItem = ({ title, subtitle, date }: any) => (
  <li className="py-3">
    <div className="flex justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <p className="text-xs text-gray-400">{date}</p>
    </div>
  </li>
);

// Component for server status items
const ServerStatusItem = ({ name, status, load }: any) => (
  <li className="py-3">
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium">{name}</p>
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              status === 'Online' ? 'bg-green-500' : 
              status === 'Maintenance' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </div>
      <div className="w-24">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${load}%` }}
          />
        </div>
        <p className="text-xs text-right mt-1">{load}% load</p>
      </div>
    </div>
  </li>
);

export default Dashboard; 