'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Message {
    role: 'user' | 'bot';
    content: string;
}

export default function ChatPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: 'Hello! I am your AI financial assistant. \n\nI can help you analyze your spending, identify trends, or find specific transactions from your history. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/login');
        }
    }, [isLoaded, isSignedIn, router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I encountered an error. Please try again." }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, something went wrong. Check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessage = (content: string) => {
        return content.split('**').map((part, index) =>
            index % 2 === 1 ? <strong key={index} className="text-blue-400">{part}</strong> : part
        );
    };

    if (!isLoaded || !isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-black text-white flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Header Area */}
            <div className="w-full max-w-4xl mx-auto px-4 py-6 z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Financial Assistant</h1>
                        <p className="text-zinc-500 text-sm">Powered by Gemini 2.5 Flash</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 w-full max-w-4xl mx-auto px-4 pb-4 z-10 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'bot' && (
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                                    <Bot size={20} className="text-blue-500" />
                                </div>
                            )}

                            <div className={cn(
                                "max-w-[80%] px-6 py-4 rounded-2xl text-base shadow-sm backdrop-blur-sm",
                                msg.role === 'user'
                                    ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/10"
                                    : "bg-zinc-900/50 border border-zinc-800/50 text-zinc-100 rounded-bl-none"
                            )}>
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {formatMessage(msg.content)}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                    <User size={20} className="text-zinc-400" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                <Bot size={20} className="text-blue-500" />
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800/50 px-6 py-4 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-2 flex gap-2 backdrop-blur-md shadow-xl">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your spending, income, or savings..."
                        className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-white placeholder-zinc-500 rounded-xl"
                        disabled={isLoading}
                        autoFocus
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </Button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-zinc-600 text-xs">AI can make mistakes. Please verify important information.</p>
                </div>
            </div>
        </div>
    );
}
