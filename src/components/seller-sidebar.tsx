'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    Upload,
    ShoppingBag,
    Settings,
    LogOut,
    Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SellerSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);

                setUser({
                    name: payload.fullName || payload.sub?.substring(0, 6) || 'User',
                    email: payload.email,
                    role: payload.role
                });
            } catch (e) {
                console.error("Invalid token", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
        router.push('/');
        router.refresh();
    };

    const menuItems = [
        { label: 'Tổng quan', href: '/seller/dashboard', icon: LayoutDashboard },
        { label: 'Quản lý tài liệu', href: '/seller/documents', icon: FileText },
        { label: 'Tải lên tài liệu', href: '/seller/upload', icon: Upload },
        { label: 'Đơn hàng', href: '/seller/orders', icon: ShoppingBag },
        { label: 'Cài đặt', href: '/seller/settings', icon: Settings },
    ];

    return (
        <div className="w-64 bg-white border-r h-screen hidden lg:flex flex-col sticky top-0">
            <div className="p-6 border-b">
                <Link href="/seller/dashboard" className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-600">Kênh Người Bán</span>
                </Link>
            </div>

            <div className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}>
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t bg-gray-50/50">
                {user && (
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="/avatars/01.png" alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{user.name}</span>
                            <span className="text-xs text-gray-500 truncate">{user.email}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Link href="/">
                        <Button variant="outline" className="w-full justify-start gap-2 h-9">
                            <Home className="h-4 w-4" /> Về trang chủ
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 h-9"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                    </Button>
                </div>
            </div>
        </div>
    );
}
