'use client';

import { signOut, useSession } from 'next-auth/react';
import { Search, LogOut } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side - spacer for mobile menu button */}
        <div className="lg:hidden w-10" />

        {/* Search (desktop only) */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search appointments, staff..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User info */}
          {session?.user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800">{session.user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{session.user.role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-teal-500/20">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
