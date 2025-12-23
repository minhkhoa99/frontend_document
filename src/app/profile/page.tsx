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
                if (data.role === 'vendor') {
                    router.push('/seller/dashboard');
                    return;
                }
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

    const handleChangePasswordInit = async () => {
        if (!user?.phone) {
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
                body: JSON.stringify({ phone: user.phone }),
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
            // 1. Verify OTP -> Get sign_key
            const res: any = await apiFetch(`/auth/verify_otp?phone=${encodeURIComponent(user?.phone || '')}&code=${otpCode}`, {
                method: 'GET',
            });

            // 2. Reset Password immediately using sign_key and stored newPassword
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
                                    <p className="text-sm text-muted-foreground">Sau khi xác nhận, chúng tôi sẽ gửi mã OTP đến <b>{user?.phone || '...'}</b>.</p>
                                    <Button onClick={handleChangePasswordInit} disabled={cpLoading || !user?.phone}>
                                        {cpLoading ? "Đang xử lý..." : "Tiếp tục & Gửi OTP"}
                                    </Button>
                                </div>
                            )}

                            {cpStep === 'otp' && (
                                <div className="space-y-4">
                                    <div className="text-sm text-center">
                                        Nhập mã OTP gửi tới <b>{user?.phone}</b>
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
        </div>
    )
}
