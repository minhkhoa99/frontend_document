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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useState } from "react"
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "buyer",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        try {

            await apiFetch('/auth/register', {
                method: 'POST',
                // Content-Type handled by apiFetch
                body: JSON.stringify({ ...values, fullName: values.name }),
            });

            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
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
