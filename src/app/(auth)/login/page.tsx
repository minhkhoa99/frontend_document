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
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const formSchema = z.object({
    email: z.string().email({
        message: "Email không hợp lệ.",
    }),
    password: z.string().min(6, {
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
    }),
})

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            const data = await res.json();
            localStorage.setItem('accessToken', data.access_token);

            // Redirect based on role
            if (data.user?.role === 'vendor') {
                router.push('/seller/dashboard');
            } else {
                router.push('/');
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
                <CardDescription>
                    Nhập email và mật khẩu để truy cập tài khoản của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="text-sm text-center text-muted-foreground">
                    Chưa có tài khoản?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Đăng ký ngay
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
