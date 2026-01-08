'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import TransactionList from '@/components/TransactionList';

interface Transaction {
    _id: string;
    date: string;
    amount: number;
    type: 'credit' | 'debit';
    merchant: string;
    rawDescription: string;
    category: string;
    channel: string;
    accountId?: {
        bankName: string;
    };
}

const CATEGORIES = ['All', 'Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Rent', 'Salary', 'Investment', 'Transfer', 'Other'];

export default function TransactionsPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [category, setCategory] = useState('All');
    const [type, setType] = useState<'all' | 'credit' | 'debit'>('all');
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/sign-in');
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user, pagination.page, category, type, search, sortOrder]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sortBy: 'date',
                sortOrder,
            });

            if (category !== 'All') params.append('category', category);
            if (type !== 'all') params.append('type', type);
            if (search) params.append('search', search);

            const response = await fetch(`/api/transactions?${params}`, {
                // headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        if (!confirm(`Delete ${ids.length} transaction(s)?`)) return;

        try {
            const response = await fetch('/api/transactions', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ transactionIds: ids }),
            });

            if (response.ok) {
                fetchTransactions();
            }
        } catch (error) {
            console.error('Failed to delete transactions:', error);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    if (!isLoaded || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Transactions</h1>
                    <p className="text-zinc-500">View and manage all your transactions</p>
                </div>

                {/* Filters */}
                <div className="bg-zinc-900 overflow-hidden rounded-2xl p-4 border border-zinc-800 mb-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Merchant or description..."
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'all' | 'credit' | 'debit')}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                            >
                                <option value="all">All</option>
                                <option value="credit">Income</option>
                                <option value="debit">Expense</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Sort</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : (
                        <TransactionList
                            transactions={transactions}
                            onDelete={handleDelete}
                            showPagination={true}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
