
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

    const router = useRouter();
    // Change Password States: 'init' (input pass) -> 'otp'
    const [cpStep, setCpStep] = useState<'init' | 'otp'>('init');
    const [cpLoading, setCpLoading] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [signKey, setSignKey] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);

    // Countdown effect
    useEffect(() => {
        if (cpStep === 'otp' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cpStep, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

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

    const handleChangePasswordInit = async () => {
        if (!profile.phone) {
            alert('Vui lòng cập nhật số điện thoại trước khi đổi mật khẩu.');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }
        if (newPassword.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setCpLoading(true);
        try {
            const resOtp: any = await apiFetch('/auth/verify_otp', {
                method: 'POST',
                body: JSON.stringify({ phone: profile.phone }),
            });
            if (resOtp.expiresIn) {
                setTimeLeft(resOtp.expiresIn);
            } else {
                setTimeLeft(180);
            }
            setCpStep('otp');
        } catch (error: any) {
            alert(error.message || 'Lỗi gửi OTP');
        } finally {
            setCpLoading(false);
        }
    };

    const handleVerifyAndReset = async () => {
        setCpLoading(true);
        try {
            // 1. Verify OTP
            const res: any = await apiFetch(`/auth/verify_otp?phone=${encodeURIComponent(profile.phone || '')}&code=${otpCode}`, {
                method: 'GET',
            });
            // 2. Reset Password
            await apiFetch('/auth/reset_password', {
                method: 'POST',
                body: JSON.stringify({ sign_key: res.sign_key, new_password: newPassword }),
            });

            alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
            router.push('/login');
        } catch (error: any) {
            alert(error.message || 'OTP không hợp lệ hoặc hết hạn');
        } finally {
            setCpLoading(false);
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
                    <TabsTrigger value="security">Bảo mật</TabsTrigger>
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

                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Đổi mật khẩu</CardTitle>
                            <CardDescription>
                                Sử dụng OTP để xác minh và đổi mật khẩu mới.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cpStep === 'init' && (
                                <div className="space-y-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label>Mật khẩu mới</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label>Xác nhận mật khẩu</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Sau khi xác nhận, chúng tôi sẽ gửi mã OTP đến <b>{profile.phone || '...'}</b>.</p>
                                    <Button onClick={handleChangePasswordInit} disabled={cpLoading || !profile.phone}>
                                        {cpLoading ? "Đang xử lý..." : "Tiếp tục & Gửi OTP"}
                                    </Button>
                                </div>
                            )}

                            {cpStep === 'otp' && (
                                <div className="space-y-4">
                                    <div className="text-sm text-center">
                                        Nhập mã OTP gửi tới <b>{profile.phone}</b>
                                        <div className="mt-1">
                                            {timeLeft > 0 ? (
                                                <span>Mã có hiệu lực trong: <span className="font-bold text-blue-600">{formatTime(timeLeft)}</span></span>
                                            ) : (
                                                <span className="text-red-500 font-medium">Mã OTP đã hết hạn</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label>Mã OTP</Label>
                                        <Input
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            placeholder="Nhập 6 số OTP"
                                            maxLength={6}
                                        />
                                    </div>
                                    <Button onClick={handleVerifyAndReset} disabled={cpLoading} className="w-full">
                                        {cpLoading ? "Đang xác thực..." : "Xác thực & Đổi mật khẩu"}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setCpStep('init')} className="w-full">Quay lại</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
