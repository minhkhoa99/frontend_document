
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SellerSettingsPage() {
    const [profile, setProfile] = useState({
        displayName: 'Nguyen Van A',
        email: 'teacher.a@example.com',
        phone: '0901234567',
    });

    const [bank, setBank] = useState({
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'NGUYEN VAN A',
    });

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
                                <Button>Lưu thay đổi</Button>
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
