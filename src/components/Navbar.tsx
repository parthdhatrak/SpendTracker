'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/upload', label: 'Upload' },
        { href: '/dashboard/transactions', label: 'Transactions' },
    ];

    return (
        <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
                            <span className="text-2xl grayscale">💰</span>
                            <span className="text-xl font-bold text-white tracking-tight">
                                SpendTracker
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-500 hidden sm:block">
                            <span className="text-white font-medium">Demo Mode</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {
                user && (
                    <div className="md:hidden border-t border-zinc-800 px-2 py-2">
                        <div className="flex justify-around">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium ${pathname === link.href
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-500'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
