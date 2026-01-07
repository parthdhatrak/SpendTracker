'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CategoryChart from '@/components/CategoryChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    PiggyBank,
    Activity,
    RefreshCw,
    CreditCard,
    TrendingUp,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Analytics {
    summary: {
        totalIncome: number;
        totalExpense: number;
        savings: number;
        transactionCount: number;
    };
    categoryBreakdown: Array<{
        category: string;
        amount: number;
        percentage: number;
    }>;
    topMerchants: Array<{
        merchant: string;
        amount: number;
        count: number;
    }>;
    alerts: string[];
}

interface Transaction {
    _id: string;
    date: string;
    amount: number;
    type: 'credit' | 'debit';
    merchant: string;
    category: string;
}

export default function DashboardPage() {
    const { user, isLoading: authLoading, token } = useAuth();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user && token) {
            fetchData();
        }
    }, [user, token]);

    // Refetch data when page becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user && token) {
                fetchData();
            }
        };

        const handleFocus = () => {
            if (user && token) {
                fetchData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [user, token]);

    const fetchData = async () => {
        try {
            const analyticsRes = await fetch('/api/analytics?period=all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (analyticsRes.ok) {
                const data = await analyticsRes.json();
                setAnalytics(data);
            }

            const txnRes = await fetch('/api/transactions?limit=5&sortBy=date&sortOrder=desc', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (txnRes.ok) {
                const data = await txnRes.json();
                setRecentTransactions(data.transactions);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    const formatAmount = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Ambient Background - Subtle Grayscale */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl opacity-20" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-zinc-700/20 rounded-full blur-3xl opacity-20" />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">
                            Dashboard
                        </h1>
                        <p className="text-zinc-400 mt-2 text-lg font-light">
                            Overview for {user.name.split(' ')[0]}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/upload">
                            <Button variant="outline" className="gap-2 border-zinc-700 hover:bg-zinc-800 text-white hover:text-white">
                                <Download className="w-4 h-4" />
                                Upload Statement
                            </Button>
                        </Link>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsLoading(true);
                                fetchData();
                            }}
                            disabled={isLoading}
                            className="bg-white text-black hover:bg-zinc-200"
                        >
                            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {isLoading && !analytics ? (
                    <div className="grid md:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-40 bg-zinc-900 rounded-xl border border-zinc-800" />
                        ))}
                    </div>
                ) : analytics ? (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Total Income</CardTitle>
                                    <ArrowUpRight className="h-4 w-4 text-white" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white tracking-tight">{formatAmount(analytics.summary.totalIncome)}</div>
                                    <p className="text-xs text-zinc-500 mt-1">Inflow this period</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses</CardTitle>
                                    <ArrowDownRight className="h-4 w-4 text-white" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white tracking-tight">{formatAmount(analytics.summary.totalExpense)}</div>
                                    <p className="text-xs text-zinc-500 mt-1">Outflow this period</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Net Savings</CardTitle>
                                    <PiggyBank className="h-4 w-4 text-white" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white tracking-tight">{formatAmount(analytics.summary.savings)}</div>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {(analytics.summary.savings / analytics.summary.totalIncome * 100).toFixed(1)}% savings rate
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Transactions</CardTitle>
                                    <Activity className="h-4 w-4 text-white" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white tracking-tight">{analytics.summary.transactionCount}</div>
                                    <p className="text-xs text-zinc-500 mt-1">Total items processed</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Analysis & Visualization Section */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Spending Chart */}
                            <Card className="lg:col-span-2 border-zinc-800 bg-zinc-900/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <TrendingUp className="w-5 h-5" />
                                        Spending Breakdown
                                    </CardTitle>
                                    <CardDescription className="text-zinc-500">
                                        Expenses by category
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <div className="h-[300px] w-full flex items-center justify-center">
                                        <CategoryChart data={analytics.categoryBreakdown} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Merchants */}
                            <Card className="border-zinc-800 bg-zinc-900/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <CreditCard className="w-5 h-5" />
                                        Top Merchants
                                    </CardTitle>
                                    <CardDescription className="text-zinc-500">
                                        Highest spending activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.topMerchants.slice(0, 5).map((merchant, i) => (
                                            <div key={merchant.merchant} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-white group-hover:bg-white group-hover:text-black transition-colors">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{merchant.merchant}</p>
                                                        <p className="text-xs text-zinc-500">{merchant.count} txns</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-white">{formatAmount(merchant.amount)}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {analytics.topMerchants.length === 0 && (
                                            <div className="text-center py-8 text-zinc-500 text-sm">
                                                No merchant data available
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Transactions */}
                        <Card className="border-zinc-800 bg-zinc-900/30">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-white">Recent Activity</CardTitle>
                                    <CardDescription className="text-zinc-500">Latest transactions</CardDescription>
                                </div>
                                <Link href="/dashboard/transactions">
                                    <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                        View All
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {recentTransactions.length > 0 ? (
                                    <div className="divide-y divide-zinc-800/50">
                                        {recentTransactions.map((txn) => (
                                            <div key={txn._id} className="flex items-center justify-between py-4 group hover:bg-zinc-900/50 px-4 -mx-4 transition-colors rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                                        {txn.type === 'credit' ? (
                                                            <ArrowDownRight className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                                            {txn.merchant}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                            <span className="capitalize px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900">{txn.category}</span>
                                                            <span>•</span>
                                                            <span>{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={cn(
                                                        "font-semibold",
                                                        txn.type === 'credit' ? "text-white" : "text-zinc-400"
                                                    )}>
                                                        {txn.type === 'credit' ? '+' : '-'}{formatAmount(txn.amount)}
                                                    </p>
                                                    <div className="text-xs text-zinc-500 capitalize">{txn.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                            <Wallet className="w-6 h-6 text-zinc-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white">No transactions yet</h3>
                                        <p className="text-zinc-500 max-w-sm mx-auto mt-2 mb-6">
                                            Upload your statement to get started.
                                        </p>
                                        <Link href="/dashboard/upload">
                                            <Button className="bg-white text-black hover:bg-zinc-200">
                                                <Download className="w-4 h-4 mr-2" />
                                                Upload First Statement
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Initial Empty State */
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                        <div className="relative mb-8 group">
                            <div className="absolute inset-0 bg-white/5 blur-xl rounded-full group-hover:bg-white/10 transition-all duration-500" />
                            <div className="relative w-24 h-24 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center justify-center">
                                <span className="text-4xl grayscale">📊</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Your Financial Hub
                        </h2>
                        <p className="text-zinc-500 max-w-md mx-auto mb-8 text-lg">
                            Get started by uploading a statement to see your spend analysis, income tracking, and savings goals.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/upload">
                                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 border-0 shadow-lg shadow-white/5">
                                    <Download className="w-5 h-5 mr-2" />
                                    Upload Statement
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
