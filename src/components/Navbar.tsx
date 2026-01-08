"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { MessageCircle } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/upload', label: 'Upload' },
        { href: '/dashboard/transactions', label: 'Transactions' },
    ];

    return (
        <nav className="border-b border-zinc-800 bg-black sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl grayscale">💰</span>
                            <span className="text-xl font-bold text-white tracking-tight">
                                SpendTracker
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="flex items-center gap-4">
                        <SignedIn>
                            <div className="hidden md:flex items-center space-x-1 mr-4">
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
                                <Link
                                    href="/chat"
                                    className={`p-2 rounded-full transition-colors ml-2 ${pathname === '/chat'
                                        ? 'text-white bg-zinc-800'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                        }`}
                                    aria-label="Open Financial Assistant"
                                >
                                    <MessageCircle size={20} />
                                </Link>
                            </div>

                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-zinc-300 hover:text-white transition-colors mr-4">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium">
                                    Get Started
                                </button>
                            </SignUpButton>
                        </SignedOut>
                    </div>
                </div>
            </div>
            {/* Mobile Navigation (Simple version for now) */}
            <SignedIn>
                <div className="md:hidden border-t border-zinc-800 px-2 py-2 flex justify-around">
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
            </SignedIn>
        </nav>
    );
}
