"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<{ fullName: string; email: string; role: string } | null>(null);
    const [formData, setFormData] = useState({ fullName: '', bio: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setUser(data);
                setFormData({ fullName: data.fullName, bio: '' }); // Bio not in DB yet
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fullName: formData.fullName }),
            });

            if (!res.ok) throw new Error('Failed to update');

            alert('Cập nhật thành công!');
            // Update local storage token if name changed? 
            // Ideally we need to refresh token to update name in it, 
            // but for now the profile page shows updated data.
            // Navbar will still show old name until logout/login unless we implement token refresh or event bus.
            window.location.reload(); // Simple way to refresh navbar data if it fetches on load
        } catch (error) {
            alert('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Đang tải...</div>;

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Cài đặt tài khoản</h1>
            <Tabs defaultValue="general" className="w-full max-w-4xl">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="security">Bảo mật</TabsTrigger>
                    <TabsTrigger value="billing">Thanh toán</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cá nhân</CardTitle>
                            <CardDescription>
                                Cập nhật thông tin cá nhân của bạn.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="name">Họ và tên</Label>
                                <Input
                                    id="name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user?.email} disabled className="bg-gray-100" />
                                <p className="text-sm text-muted-foreground">Email không thể thay đổi.</p>
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="bio">Giới thiệu ngắn</Label>
                                <Input
                                    id="bio"
                                    placeholder="Giới thiệu về bản thân..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground">Tính năng đang phát triển.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleUpdateProfile} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="security" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mật khẩu</CardTitle>
                            <CardDescription>
                                Đổi mật khẩu tài khoản.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">Chức năng đổi mật khẩu đang được bảo trì.</p>
                            <div className="grid w-full items-center gap-1.5 opacity-50 pointer-events-none">
                                <Label htmlFor="current">Mật khẩu hiện tại</Label>
                                <Input id="current" type="password" />
                            </div>
                            {/* ... disabled inputs ... */}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="billing" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Phương thức thanh toán</CardTitle>
                            <CardDescription>Quản lý ví và thẻ ngân hàng.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Chức năng đang được phát triển.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
