'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, LayoutDashboard, User as UserIcon, FileText } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);



    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // Simple JWT decode without external library
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    const payload = JSON.parse(jsonPayload);

                    setUser({
                        name: payload.fullName || payload.sub?.substring(0, 6) || 'User', // Fallback
                        email: payload.email,
                        role: payload.role
                    });
                } catch (e) {
                    console.error("Invalid token", e);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkAuth();
        window.addEventListener('authChange', checkAuth);
        return () => window.removeEventListener('authChange', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
        router.push('/');
        router.refresh();
    };

    // Hide navbar on auth pages, seller dashboard, and admin dashboard
    if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/seller') || pathname.startsWith('/admin')) {
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
                        <Link href="/categories" className="transition-colors hover:text-primary">Danh mục</Link>
                        <Link href="/documents" className="transition-colors hover:text-primary">Tài liệu</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                        <ShoppingCart className="h-5 w-5" />
                    </Button>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/avatars/01.png" alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {user.role === 'vendor' && (
                                    <Link href="/seller/dashboard">
                                        <DropdownMenuItem>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Kênh người bán</span>
                                        </DropdownMenuItem>
                                    </Link>
                                )}
                                <Link href="/cart">
                                    <DropdownMenuItem>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span>Giỏ hàng của tôi</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link href="/my-documents">
                                    <DropdownMenuItem>
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>Tài liệu của tôi</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link href="/profile">
                                    <DropdownMenuItem>
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Hồ sơ cá nhân</span>
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button size="sm">Đăng nhập</Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
