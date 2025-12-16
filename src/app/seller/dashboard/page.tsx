
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, MoreHorizontal, Edit, Trash, DollarSign, Download, Eye } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Document {
    id: string;
    title: string;
    status: string;
    price: { amount: number } | null;
    createdAt: string;
}

interface Stats {
    totalRevenue: number;
    totalDownloads: number;
    totalViews: number;
}

export default function SellerDashboard() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalDownloads: 0, totalViews: 0 });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            // Basic structure: fetch stats and documents in parallel or sequence
            try {
                // Fetch Stats
                // Note: If backend endpoint doesn't exist, apiFetch throws.
                // We'll wrap in individual try/catch if we want partial loading, or one big one.
                const statsDataPromise = apiFetch<Stats>('/seller/stats');
                const docsDataPromise = apiFetch<Document[]>('/seller/documents');

                const [statsData, docsData] = await Promise.all([statsDataPromise, docsDataPromise]);

                setStats(statsData);
                // Ensure docsData is array
                if (Array.isArray(docsData)) {
                    setDocuments(docsData);
                }
            } catch (err) {
                console.error("Failed to load seller dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tổng quan</h1>
                    <p className="text-gray-500">Xem báo cáo hoạt động và quản lý tài liệu của bạn.</p>
                </div>
                <Link href="/seller/upload">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" /> Tải lên tài liệu mới
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doanh thu tạm tính</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} đ</div>
                        <p className="text-xs text-muted-foreground">+0% so với tháng trước</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lượt tải</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                        <p className="text-xs text-muted-foreground">+0% so với tháng trước</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalViews}</div>
                        <p className="text-xs text-muted-foreground">Traffic ổn định</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Documents List */}
            <Card>
                <CardHeader>
                    <CardTitle>Tài liệu gần đây</CardTitle>
                    <CardDescription>
                        Danh sách các tài liệu bạn đã tải lên gần đây.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10">Đang tải dữ liệu...</div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                            <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                            <p className="text-lg font-medium">Chưa có tài liệu nào</p>
                            <p className="text-sm mb-4">Hãy bắt đầu chia sẻ kiến thức để kiếm thêm thu nhập.</p>
                            <Link href="/seller/upload">
                                <Button variant="outline">Tải tài liệu ngay</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:border-blue-200 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <Link href={`/documents/${doc.id}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
                                                {doc.title}
                                            </Link>
                                            <div className="flex items-center text-sm text-gray-500 gap-3 mt-1">
                                                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="font-medium text-gray-700">
                                                    {doc.price && doc.price.amount > 0 ? `${doc.price.amount.toLocaleString()} đ` : 'Miễn phí'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'} className={
                                            doc.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''
                                        }>
                                            {doc.status === 'approved' ? 'Đã duyệt' :
                                                doc.status === 'pending' ? 'Chờ duyệt' : doc.status}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" title="Chỉnh sửa">
                                                <Edit className="h-4 w-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Xóa">
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
