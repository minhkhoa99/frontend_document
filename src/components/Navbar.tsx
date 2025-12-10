'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, User, Upload } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const pathname = usePathname();

    // Hide navbar on auth pages if needed, but usually good to keep simple logo
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-primary">EduMarket</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground hover:text-foreground">
                        <Link href="/categories" className="transition-colors hover:text-primary">Categories</Link>
                        <Link href="/documents" className="transition-colors hover:text-primary">Documents</Link>
                    </nav>
                </div>

                <div className="flex flex-1 items-center justify-center px-8 hidden md:flex">
                    <div className="relative w-full max-w-lg">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search for documents, exams, slides..."
                            className="w-full bg-slate-50 pl-9 focus-visible:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/seller/upload">
                        <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                            <Upload className="h-4 w-4" />
                            <span>Sell Document</span>
                        </Button>
                    </Link>

                    <Button variant="ghost" size="icon">
                        <ShoppingCart className="h-5 w-5" />
                    </Button>

                    <Link href="/login">
                        <Button size="sm">Login</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
