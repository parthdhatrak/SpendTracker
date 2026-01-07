'use client';

import { useState } from 'react';

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

interface TransactionListProps {
    transactions: Transaction[];
    onDelete?: (ids: string[]) => void;
    showPagination?: boolean;
    pagination?: {
        page: number;
        totalPages: number;
        total: number;
    };
    onPageChange?: (page: number) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Food': '🍔',
    'Travel': '✈️',
    'Shopping': '🛒',
    'Entertainment': '🎬',
    'Bills': '📄',
    'Health': '🏥',
    'Education': '📚',
    'Rent': '🏠',
    'Salary': '💰',
    'Investment': '📈',
    'Transfer': '↔️',
    'Other': '📦',
};

export default function TransactionList({
    transactions,
    onDelete,
    showPagination = false,
    pagination,
    onPageChange,
}: TransactionListProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleAll = () => {
        if (selectedIds.size === transactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(transactions.map(t => t._id)));
        }
    };

    const handleDelete = () => {
        if (onDelete && selectedIds.size > 0) {
            onDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatAmount = (amount: number, type: 'credit' | 'debit') => {
        const prefix = type === 'credit' ? '+' : '-';
        return `${prefix}₹${amount.toLocaleString('en-IN')}`;
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <div className="text-4xl mb-4">📭</div>
                <p>No transactions found</p>
            </div>
        );
    }

    return (
        <div>
            {/* Bulk Actions */}
            {onDelete && selectedIds.size > 0 && (
                <div className="mb-4 p-3 bg-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">
                        {selectedIds.size} transaction(s) selected
                    </span>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                    >
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Transaction Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {onDelete && (
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === transactions.length}
                                        onChange={toggleAll}
                                        className="rounded border-slate-600 bg-slate-800 text-white focus:ring-white"
                                    />
                                </th>
                            )}
                            <th className="py-3 px-4 text-left text-slate-400 text-sm font-medium">Date</th>
                            <th className="py-3 px-4 text-left text-slate-400 text-sm font-medium">Merchant</th>
                            <th className="py-3 px-4 text-left text-slate-400 text-sm font-medium">Category</th>
                            <th className="py-3 px-4 text-left text-slate-400 text-sm font-medium">Channel</th>
                            <th className="py-3 px-4 text-right text-slate-400 text-sm font-medium">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((txn) => (
                            <tr
                                key={txn._id}
                                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                            >
                                {onDelete && (
                                    <td className="py-3 px-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(txn._id)}
                                            onChange={() => toggleSelection(txn._id)}
                                            className="rounded border-slate-600 bg-slate-800 text-white focus:ring-white"
                                        />
                                    </td>
                                )}
                                <td className="py-3 px-4 text-slate-300 text-sm">
                                    {formatDate(txn.date)}
                                </td>
                                <td className="py-3 px-4">
                                    <div>
                                        <p className="text-white font-medium">{txn.merchant}</p>
                                        <p className="text-slate-500 text-xs truncate max-w-[200px]" title={txn.rawDescription}>
                                            {txn.rawDescription}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 text-xs">
                                        <span>{CATEGORY_ICONS[txn.category] || '📦'}</span>
                                        <span className="text-slate-300">{txn.category}</span>
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-slate-400 text-sm">{txn.channel}</span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <span
                                        className={`font-semibold ${txn.type === 'credit' ? 'text-white' : 'text-zinc-400'
                                            }`}
                                    >
                                        {formatAmount(txn.amount, txn.type)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {showPagination && pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-slate-400 text-sm">
                        Showing {((pagination.page - 1) * 50) + 1} - {Math.min(pagination.page * 50, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange?.(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-slate-400">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
