'use client';

import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
    category: string;
    amount: number;
    percentage: number;
}

interface CategoryChartProps {
    data: CategoryData[];
}

const CATEGORY_COLORS: Record<string, string> = {
    'Food': '#f43f5e',      // Rose 500
    'Travel': '#0ea5e9',    // Sky 500
    'Shopping': '#d946ef',  // Fuchsia 500
    'Entertainment': '#8b5cf6', // Violet 500
    'Bills': '#f59e0b',     // Amber 500
    'Health': '#10b981',    // Emerald 500
    'Education': '#3b82f6', // Blue 500
    'Rent': '#6366f1',      // Indigo 500
    'Salary': '#14b8a6',    // Teal 500
    'Investment': '#84cc16', // Lime 500
    'Transfer': '#94a3b8',  // Slate 400
    'Other': '#71717a',     // Zinc 500
};

export default function CategoryChart({ data }: CategoryChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                No expense data available
            </div>
        );
    }

    const chartData = {
        labels: data.map(d => d.category),
        datasets: [
            {
                data: data.map(d => d.amount),
                backgroundColor: data.map(d => CATEGORY_COLORS[d.category] || '#71717a'),
                borderColor: '#09090b', // zinc-950 (matches card bg)
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: '#94a3b8',
                    padding: 15,
                    font: {
                        size: 12,
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: function (context: any) {
                        const value = context.parsed;
                        const total = data.reduce((sum, d) => sum + d.amount, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="h-64">
            <Pie data={chartData} options={options} />
        </div>
    );
}
