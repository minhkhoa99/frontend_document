
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiFetch } from '@/lib/api';

export default function SellerSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        displayName: '',
        email: '',
        phone: '',
    });

    const [bank, setBank] = useState({
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'NGUYEN VAN A',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiFetch<any>('/users/profile');
                setProfile({
                    displayName: data.fullName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                });
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await apiFetch('/users/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    fullName: profile.displayName,
                    phone: profile.phone
                }),
            });
            alert('Cập nhật thành công!');
            // Refresh sidebar/navbar
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cài đặt Gian hàng</h1>
                <p className="text-gray-500">Quản lý thông tin cá nhân và tài khoản thanh toán.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
                    <TabsTrigger value="payment">Tài khoản thanh toán</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hồ sơ</CardTitle>
                            <CardDescription>
                                Thông tin này sẽ được hiển thị công khai trên trang cá nhân của bạn.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Tên hiển thị</Label>
                                <Input
                                    id="displayName"
                                    value={profile.displayName}
                                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input
                                    id="phone"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                            <div className="pt-4">
                                <Button onClick={handleSaveProfile} disabled={saving}>
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin Ngân hàng</CardTitle>
                            <CardDescription>
                                Doanh thu của bạn sẽ được chuyển vào tài khoản này hàng tháng.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Tên Ngân hàng</Label>
                                    <Input
                                        id="bankName"
                                        placeholder="VD: Vietcombank, Techcombank"
                                        value={bank.bankName}
                                        onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Số tài khoản</Label>
                                    <Input
                                        id="accountNumber"
                                        value={bank.accountNumber}
                                        onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountName">Tên chủ tài khoản</Label>
                                <Input
                                    id="accountName"
                                    placeholder="VIET HOA KHONG DAU"
                                    value={bank.accountName}
                                    onChange={(e) => setBank({ ...bank, accountName: e.target.value })}
                                />
                            </div>
                            <div className="pt-4">
                                <Button>Cập nhật tài khoản</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
