'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'add-patient', label: 'Add Patient', href: '/add-patient', icon: iconUserPlus() },
  { id: 'cash-receipt', label: 'Cash Receipt', href: '/cash-receipt', icon: iconReceipt() },
  { id: 'add-test', label: 'Add Test', href: '/add-test', icon: iconBeaker() },
  { id: 'add-doctor', label: 'Add Doctor', href: '/add-doctor', icon: iconDoctor() },
  { id: 'daily-expenses', label: 'Daily Expenses', href: '/daily-expenses', icon: iconCurrency() },
  { id: 'referral-amount', label: 'Referral Amount', href: '/referral-amount', icon: iconReferral() },
  { id: 'daily-collection', label: 'Daily Collection', href: '/daily-collection', icon: iconChart() },
  { id: 'manage-users', label: 'Manage Users', href: '/admin/manage-users', icon: iconAdminUsers(), adminOnly: true },
  { id: 'run-scripts', label: 'Run Scripts', href: '/admin/scripts', icon: iconScript(), adminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Filter nav items based on user role
  const availableNavItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableNavItems;
    return availableNavItems.filter(n => n.label.toLowerCase().includes(q) || n.href.toLowerCase().includes(q));
  }, [query, availableNavItems]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-3 py-1 rounded">Skip to content</a>

        {/* Topbar */}
        <header className="sticky top-0 z-40 w-full border-b" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
            <button aria-label="Toggle sidebar" className="md:hidden p-2 rounded hover:bg-[var(--color-secondary)]" onClick={() => setSidebarOpen(v => !v)}>
              {iconMenu()}
            </button>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>H</span>
              <span>HMS Admin</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <input
                  aria-label="Quick search navigation"
                  placeholder="Search pages (e.g. patient, receipt)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-72 rounded-md border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#fff', borderColor: 'var(--color-secondary)' }}
                />
                {query && (
                  <div className="absolute mt-1 w-full rounded-md border bg-white shadow-lg max-h-64 overflow-auto" style={{ borderColor: 'var(--color-secondary)' }}>
                    {filtered.map(item => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-secondary)]"
                        onClick={() => setQuery('')}
                      >
                        <span className="text-gray-500">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    {!filtered.length && <div className="px-3 py-2 text-sm text-gray-500">No matches</div>}
                  </div>
                )}
              </div>
              
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-sm shadow-sm hover:bg-[var(--color-secondary)]"
                  style={{ borderColor: 'var(--color-secondary)' }}
                >
                  <span>{user?.firstName} {user?.lastName}</span>
                  {isAdmin && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">Admin</span>}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border" style={{ borderColor: 'var(--color-secondary)' }}>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/change-password"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Change Password
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Layout */}
        <div className="flex">
          {/* Sidebar */}
          <nav aria-label="Main" className={`fixed md:sticky left-0 top-14 md:top-16 z-30 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-64 transform border-r bg-white p-3 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`} style={{ borderColor: 'var(--color-secondary)' }}>
            <ul className="space-y-1">
              {availableNavItems.map(item => {
                const active = pathname === item.href;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${active ? 'text-[var(--color-primary)] bg-[var(--color-secondary)]' : ''} hover:bg-[var(--color-secondary)]`}
                    >
                      <span className={`text-gray-500 ${active ? 'text-[var(--color-primary)]' : ''}`}>{item.icon}</span>
                      <span>{item.label}</span>
                      {item.adminOnly && <span className="ml-auto px-1 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">Admin</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Main content */}
          <main id="main" className="flex-1 w-full min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Icons (small inline SVG helpers)
function iconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}
function iconUserPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
  );
}
function iconReceipt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21V5a2 2 0 0 0-2-2H8l-4 4v14l3-2 3 2 3-2 3 2 3-2z"/><path d="M8 10h8"/><path d="M8 14h8"/></svg>
  );
}
function iconBeaker() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12"/><path d="M14 2v6l7 11a2 2 0 0 1-1.7 3H4.7A2 2 0 0 1 3 19l7-11V2"/></svg>
  );
}
function iconDoctor() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 22a7.5 7.5 0 0 1 13 0"/></svg>
  );
}
function iconCurrency() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H15a3.5 3.5 0 0 1 0 7H6"/></svg>
  );
}
function iconReferral() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82h0A1.65 1.65 0 0 0 21 12h.09A2 2 0 1 1 21 16h-.09a1.65 1.65 0 0 0-1.51-1z"/></svg>
  );
}
function iconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>
  );
}

function iconAdminUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function iconScript() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}
