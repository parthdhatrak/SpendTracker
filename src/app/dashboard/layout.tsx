import Chatbot from '@/components/Chatbot';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen">
            {children}
            <Chatbot />
        </div>
    );
}
