"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiFetch } from '@/lib/api'

// Schema for Phone Input
const phoneSchema = z.object({
    phone: z.string().refine((val) => {
        const clean = val.replace(/\s+/g, '');
        return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(clean);
    }, {
        message: "Số điện thoại không hợp lệ.",
    }),
})

// Schema for OTP Input
const otpSchema = z.object({
    code: z.string().length(6, {
        message: "Mã OTP phải có 6 ký tự.",
    }),
})

// Schema for Reset Password
const passwordSchema = z.object({
    password: z.string().min(6, {
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
    }),
    confirmPassword: z.string().min(6, {
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp.",
    path: ["confirmPassword"],
})

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // State to store data between steps
    const [registeredPhone, setRegisteredPhone] = useState('');
    const [signKey, setSignKey] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    // Countdown effect
    useEffect(() => {
        if (step === 'otp' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Forms
    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { phone: "" },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { code: "" },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    // Step 1: Send OTP
    async function onSendOtp(values: z.infer<typeof phoneSchema>) {
        setLoading(true);
        setError(null);
        try {
            const cleanPhone = values.phone.replace(/\s+/g, '');
            const resOtp: any = await apiFetch('/auth/verify_otp', {
                method: 'POST',
                body: JSON.stringify({ phone: cleanPhone }),
            });
            if (resOtp.expiresIn) {
                setTimeLeft(resOtp.expiresIn);
            } else {
                setTimeLeft(180);
            }
            setRegisteredPhone(cleanPhone);
            setStep('otp');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Step 2: Verify OTP
    async function onVerifyOtp(values: z.infer<typeof otpSchema>) {
        setLoading(true);
        setError(null);
        try {
            const res: any = await apiFetch(`/auth/verify_otp?phone=${encodeURIComponent(registeredPhone)}&code=${values.code}`, {
                method: 'GET',
            });
            setSignKey(res.sign_key);
            setStep('password');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Step 3: Reset Password
    async function onResetPassword(values: z.infer<typeof passwordSchema>) {
        setLoading(true);
        setError(null);
        try {
            await apiFetch('/auth/reset_password', {
                method: 'POST',
                body: JSON.stringify({
                    sign_key: signKey,
                    new_password: values.password
                }),
            });
            alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Render Steps
    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
                <CardDescription>
                    {step === 'phone' && "Nhập số điện thoại để lấy lại mật khẩu."}
                    {step === 'otp' && "Nhập mã OTP đã gửi về email."}
                    {step === 'password' && "Thiết lập mật khẩu mới."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {step === 'phone' && (
                    <Form {...phoneForm}>
                        <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-4">
                            <FormField
                                control={phoneForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0912345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? "Đang gửi..." : "Gửi mã OTP"}
                            </Button>
                        </form>
                    </Form>
                )}

                {step === 'otp' && (
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                            <div className="text-sm text-center mb-2">
                                OTP gửi đến SĐT: <b>{registeredPhone}</b>
                                <div className="mt-1">
                                    {timeLeft > 0 ? (
                                        <span>Mã có hiệu lực trong: <span className="font-bold text-blue-600">{formatTime(timeLeft)}</span></span>
                                    ) : (
                                        <span className="text-red-500 font-medium">Mã OTP đã hết hạn</span>
                                    )}
                                </div>
                            </div>
                            <FormField
                                control={otpForm.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã OTP</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123456" maxLength={6} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                            </Button>
                            <div className="text-center mt-2">
                                <Button variant="link" onClick={() => setStep('phone')} className="text-sm p-0 h-auto">
                                    Quay lại nhập SĐT
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {step === 'password' && (
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                            </Button>
                        </form>
                    </Form>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="text-sm text-center text-muted-foreground">
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
