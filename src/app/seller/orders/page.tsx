
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
    id: string;
    price: number;
    document: {
        title: string;
    };
    order: {
        id: string;
        createdAt: string;
        user: {
            email: string; // Assuming we populate user
        };
        status: string;
    };
}

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        // Wait, we need an API for this: GET /seller/orders
        // Currently not implemented in backend controller.
        // I will mock it or try to fetch if I implement it.
        // Let's implement Frontend assuming API exists, then I'll add Backend API.
        fetch(`${apiUrl}/seller/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Đơn hàng</h1>
                <p className="text-gray-500">Xem lịch sử bán hàng và doanh thu từ các tài liệu của bạn.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử giao dịch</CardTitle>
                    <CardDescription>
                        Danh sách các tài liệu đã được mua.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10">Đang tải...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            Chưa có đơn hàng nào.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-white"
                                >
                                    <div>
                                        <div className="font-medium text-gray-900">{item.document.title}</div>
                                        <div className="text-sm text-gray-500">
                                            Mã đơn: #{item.order.id.slice(0, 8)} • {new Date(item.order.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Người mua: {item.order.user?.email || 'Ẩn danh'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">+{Number(item.price).toLocaleString()} đ</div>
                                        <Badge variant="outline" className="mt-1">
                                            {item.order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
