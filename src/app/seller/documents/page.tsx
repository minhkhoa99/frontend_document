
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Trash, Plus } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    status: string;
    price: { amount: number } | null;
    createdAt: string;
}

export default function SellerDocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        fetch(`${apiUrl}/seller/documents`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setDocuments(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Tài liệu</h1>
                    <p className="text-gray-500">Xem và quản lý tất cả các tài liệu bạn đã tải lên.</p>
                </div>
                <Link href="/seller/upload">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Tải lên tài liệu mới
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách tài liệu</CardTitle>
                    <CardDescription>
                        Bạn đang có {documents.length} tài liệu.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10">Đang tải...</div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            Chưa có tài liệu nào.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 line-clamp-1">{doc.title}</div>
                                            <div className="flex items-center text-sm text-gray-500 gap-2">
                                                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{doc.price && doc.price.amount > 0 ? `${doc.price.amount.toLocaleString()} đ` : 'Miễn phí'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                                            {doc.status === 'approved' ? 'Đã duyệt' :
                                                doc.status === 'pending' ? 'Chờ duyệt' : doc.status}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
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
