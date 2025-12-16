
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Trash, Plus, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Document {
    id: string;
    title: string;
    status: string;
    price: { amount: number } | null;
    createdAt: string;
    isActive: boolean;
}

export default function SellerDocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch<Document[]>('/seller/documents')
            .then(data => {
                // Ensure data is array; apiFetch unwraps {success: true, data: [...]} to [...]
                // If error (401), apiFetch redirects.
                if (Array.isArray(data)) {
                    setDocuments(data);
                } else {
                    setDocuments([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleToggleActive = async (doc: Document) => {
        try {
            const newStatus = !doc.isActive;
            await apiFetch(`/seller/documents/${doc.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: newStatus })
            });

            // If success (no throw)
            setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isActive: newStatus } : d));
        } catch (error) {
            console.error('Toggle error', error);
            alert('Có lỗi xảy ra.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) return;

        try {
            await apiFetch(`/seller/documents/${id}`, {
                method: 'DELETE',
            });
            // If success
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            alert('Đã xóa tài liệu thành công.');
        } catch (error) {
            console.error('Delete error', error);
            alert('Có lỗi xảy ra.');
        }
    };

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
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                                                {doc.status === 'approved' ? 'Đã duyệt' :
                                                    doc.status === 'pending' ? 'Chờ duyệt' : doc.status}
                                            </Badge>
                                            {!doc.isActive && (
                                                <Badge variant="outline" className="text-gray-500 border-gray-400">
                                                    Đã ẩn
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleToggleActive(doc)}
                                                title={doc.isActive ? "Ẩn tài liệu" : "Hiện tài liệu"}
                                            >
                                                {doc.isActive ? <Eye className="h-4 w-4 text-gray-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                                            </Button>
                                            <Link href={`/seller/documents/${doc.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
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
