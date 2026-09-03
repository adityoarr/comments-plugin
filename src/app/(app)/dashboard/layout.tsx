import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Comments Plugin
              </Link>
              <nav className="flex gap-6">
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  Sites
                </Link>
                <Link href="/dashboard/comments" className="text-sm text-gray-600 hover:text-gray-900">
                  Comments
                </Link>
              </nav>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}