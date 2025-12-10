"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
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
                                <Input id="name" defaultValue="Nguyễn Văn A" />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue="teacher@example.com" disabled />
                                <p className="text-sm text-muted-foreground">Email không thể thay đổi.</p>
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="bio">Giới thiệu ngắn</Label>
                                <Input id="bio" placeholder="Giáo viên Toán THPT..." />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Lưu thay đổi</Button>
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
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="current">Mật khẩu hiện tại</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="new">Mật khẩu mới</Label>
                                <Input id="new" type="password" />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="confirm">Xác nhận mật khẩu mới</Label>
                                <Input id="confirm" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Đổi mật khẩu</Button>
                        </CardFooter>
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
