'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { FileText, Download, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MyDocument {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    createdAt: string;
    purchaseDate: string;
    category?: { name: string };
    price?: { amount: number; currency: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MyDocumentsPage() {
    const [documents, setDocuments] = useState<MyDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchMyDocuments();
    }, []);

    const fetchMyDocuments = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(`${API_URL}/orders/my-documents`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(res.status);
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            } else {
                console.error('Failed to fetch my documents');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (doc: MyDocument) => {
        // In a real app, this would be a secure download endpoint
        window.open(doc.fileUrl, '_blank');
    };

    if (loading) return <div className="p-10 text-center">Đang tải...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Tài liệu của tôi</h1>

                {documents.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy tài liệu</h3>
                        <p className="text-gray-500 mb-6">Bạn chưa mua tài liệu nào.</p>
                        <Button asChild>
                            <Link href="/">Khám phá tài liệu</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {documents.map((doc) => (
                            <Card key={doc.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center border-b">
                                    <FileText className="h-16 w-16 text-gray-300" />
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="mb-2">{doc.category?.name || 'Tài liệu'}</Badge>
                                            <h3 className="font-bold text-lg leading-tight line-clamp-2">
                                                <Link href={`/documents/${doc.id}`} className="hover:underline">
                                                    {doc.title}
                                                </Link>
                                            </h3>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-grow">
                                    <div className="text-sm text-gray-500 flex items-center mt-2">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Ngày mua: {new Date(doc.purchaseDate).toLocaleDateString('vi-VN')}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button className="w-full" onClick={() => handleDownload(doc)}>
                                        <Download className="mr-2 h-4 w-4" /> Tải về
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
