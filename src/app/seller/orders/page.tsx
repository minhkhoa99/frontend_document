
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

import { apiFetch } from '@/lib/api';

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Seller Orders using apiFetch (auto handled: cookies, standardized response)
        apiFetch<OrderItem[]>('/seller/orders')
            .then(data => {
                // Check if data is array (if not, maybe backend returned something else or error handled globally)
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    setOrders([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch seller orders", err);
            })
            .finally(() => {
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
