"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { apiFetch } from "@/lib/api"
// const API_URL = ... (managed by apiFetch)

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<{ fullName: string; email: string; role: string; phone?: string } | null>(null);
    const [formData, setFormData] = useState({ fullName: '', bio: '', phone: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiFetch<any>('/users/profile');
                setUser(data);
                setFormData({
                    fullName: data.fullName,
                    bio: '',
                    phone: data.phone || ''
                });
            } catch (error) {
                console.error(error);
                // apiFetch handles redirect on 401 if not suppressed
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            await apiFetch('/users/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    fullName: formData.fullName,
                    phone: formData.phone
                }),
            });

            alert('Cập nhật thành công!');
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
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="security">Bảo mật</TabsTrigger>
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
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    placeholder="0912345678"
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
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
            </Tabs>
        </div>
    )
}
