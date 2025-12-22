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
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"


import { apiFetch } from '@/lib/api';

// const API_URL = ...

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Tên phải có ít nhất 2 ký tự.",
    }),
    email: z.string().email({
        message: "Email không hợp lệ.",
    }),
    phone: z.string().refine((val) => {
        const clean = val.replace(/\s+/g, '');
        return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(clean);
    }, {
        message: "Số điện thoại không hợp lệ.",
    }),
    password: z.string().min(6, {
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
    }),
    role: z.enum(["buyer", "vendor"]),
})

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Step: 'register' | 'otp'
    const [step, setStep] = useState<'register' | 'otp'>('register');
    const [registeredPhone, setRegisteredPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            role: "buyer",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        try {
            // Step 1: Init Register
            const resInit: any = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email: values.email,
                    phone: values.phone.replace(/\s+/g, ''), // Clean spaces
                    password: values.password
                    // fullName and role will be handled if backend supports it or after verify
                    // Currently backend AuthController.register takes RegisterInitDto (email, phone, password)
                    // The fullName updating might need another step or update RegisterInitDto. 
                    // Assuming basic register first.
                }),
            });

            // If user exists and verified
            if (resInit.verified) {
                setError('Tài khoản đã tồn tại. Vui lòng đăng nhập.');
                return;
            }

            // Step 2: Send OTP
            const resOtp: any = await apiFetch('/auth/verify_otp', {
                method: 'POST',
                body: JSON.stringify({ phone: values.phone.replace(/\s+/g, '') }), // Clean spaces
            });
            if (resOtp.expiresIn) {
                setTimeLeft(resOtp.expiresIn);
            } else {
                setTimeLeft(180); // Fallback
            }
            setRegisteredPhone(values.phone.replace(/\s+/g, ''));
            setStep('otp');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function onVerifyOtp() {
        setLoading(true);
        setError(null);
        try {
            // Step 3: Verify OTP
            // GET /auth/verify_otp?phone=...&code=...
            const verifyRes: any = await apiFetch(`/auth/verify_otp?phone=${encodeURIComponent(registeredPhone)}&code=${otpCode}`, {
                method: 'GET',
            });

            // Step 4: Finalize (Active Account)
            await apiFetch('/auth/finalize_register', {
                method: 'POST',
                body: JSON.stringify({ sign_key: verifyRes.sign_key }),
            });

            alert('Xác thực thành công! Vui lòng đăng nhập.');
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (step === 'otp') {
        return (
            <Card className="border-none shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Xác thực OTP</CardTitle>
                    <CardDescription>
                        Mã OTP đã được gửi đến email của bạn.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label>Mã OTP</Label>
                        <Input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Nhập 6 số OTP"
                            maxLength={6}
                        />
                        <div className="text-sm text-muted-foreground text-center">
                            {timeLeft > 0 ? (
                                <span>Mã OTP có hiệu lực trong: <span className="font-bold text-blue-600">{formatTime(timeLeft)}</span></span>
                            ) : (
                                <span className="text-red-500">Mã OTP đã hết hạn. Vui lòng gửi lại.</span>
                            )}
                        </div>
                    </div>
                    <Button onClick={onVerifyOtp} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? "Đang xác thực..." : "Xác nhận"}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
                <CardDescription>
                    Tạo tài khoản mới để tham gia EduMarket.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {/* 
                  Note: Role selection is in UI but RegisterInitDto currently doesn't take 'role'.
                  If role is crucial at init, we need to update Backend DTO.
                  For now, assuming default UserRole.BUYER as per Backend Service logic.
                  Or we can send it if we update Backend DTO.
                */}
                <Tabs defaultValue="buyer" className="w-full" onValueChange={(val) => form.setValue("role", val as "buyer" | "vendor")}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="buyer">Người mua</TabsTrigger>
                        <TabsTrigger value="vendor">Người bán</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và tên</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nguyễn Văn A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
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
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Tiếp tục"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="text-sm text-center text-muted-foreground">
                    Đã có tài khoản?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
