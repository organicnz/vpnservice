import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center lg:text-left mb-8 lg:mb-0">
          VPN Subscription Admin Panel
        </h1>
        <div className="flex justify-center lg:justify-end">
          <Link 
            href="/login" 
            className="btn btn-primary"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600 mb-4">
            Manage user accounts, permissions, and subscription details.
          </p>
          <Link href="/dashboard/users" className="text-primary-600 hover:underline">
            Manage Users →
          </Link>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
          <p className="text-gray-600 mb-4">
            Configure and manage different VPN subscription plans and pricing.
          </p>
          <Link href="/dashboard/plans" className="text-primary-600 hover:underline">
            Manage Plans →
          </Link>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Server Status</h2>
          <p className="text-gray-600 mb-4">
            Monitor VPN server status, traffic, and health metrics.
          </p>
          <Link href="/dashboard/servers" className="text-primary-600 hover:underline">
            View Servers →
          </Link>
        </div>
      </div>
    </main>
  );
} 