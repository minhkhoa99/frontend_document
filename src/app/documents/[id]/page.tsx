'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Eye, Download, ShoppingCart, Share2, Flag, FileText, Calendar, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import dynamic from 'next/dynamic';
import FilePlaceholder from '@/components/file-placeholder';

const PdfViewer = dynamic(() => import('@/components/pdf-viewer'), { ssr: false });

interface Document {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    price: { amount: number; currency: string } | null;
    author: { fullName: string; id: string } | null;
    category: { name: string; slug: string } | null;
    totalPage: number;
    createdAt: string;
    isPurchased?: boolean;
}

export default function DocumentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState<number>(0);

    useEffect(() => {
        if (id) {
            apiFetch<Document>(`/documents/${id}`)
                .then((data) => {
                    setDocument(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch document', err);
                    setLoading(false);
                });
        }
    }, [id]);

    const addToCart = async () => {
        if (!document) return;
        try {
            await apiFetch('/cart', {
                method: 'POST',
                body: JSON.stringify({ documentId: document.id }),
            });
            alert('Đã thêm vào giỏ hàng!');
        } catch (err) {
            alert('Thêm thất bại (có thể đã có trong giỏ?)');
            console.error(err);
        }
    };

    const buyNow = async () => {
        await addToCart();
        router.push('/cart');
    };

    if (loading) return <div className="text-center py-20">Đang tải tài liệu...</div>;
    if (!document) return <div className="text-center py-20">Không tìm thấy tài liệu</div>;

    const isFree = !document.price || document.price.amount === 0;
    const canViewFull = isFree || document.isPurchased;

    // Extract file extension
    const getFileExtension = (url: string) => {
        return url.split('.').pop()?.toLowerCase() || '';
    };

    const fileExtension = document?.fileUrl ? getFileExtension(document.fileUrl) : '';
    const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/documents/${document?.id}/file`;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 text-sm text-gray-500">
                    <Link href="/" className="hover:text-primary">Trang chủ</Link> /
                    <Link href="/categories" className="hover:text-primary"> Danh mục</Link> /
                    <span className="text-gray-900 font-medium ml-1 truncate">{document.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Preview */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* PDF Viewer or Placeholder */}
                        <div className="bg-gray-200/50 rounded-xl p-4 sm:p-6 flex flex-col items-center min-h-[600px] border border-gray-200/60">
                            {document.fileUrl ? (
                                fileExtension === 'pdf' ? (
                                    <PdfViewer
                                        fileUrl={proxyUrl}
                                        isFree={isFree}
                                        canViewFull={!!canViewFull}
                                        price={document.price?.amount || 0}
                                        buyNow={buyNow}
                                        onPagesLoad={setNumPages}
                                    />
                                ) : (
                                    <FilePlaceholder
                                        extension={fileExtension}
                                        fileUrl={proxyUrl}
                                        isFree={isFree}
                                        canViewFull={!!canViewFull}
                                        price={document.price?.amount || 0}
                                        buyNow={buyNow}
                                    />
                                )
                            ) : (
                                <div className="text-center p-12 bg-white rounded-lg w-full">
                                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700">Không có bản xem trước</h3>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{document.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                    {document.category?.name || 'Chung'}
                                </Badge>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1.5" />
                                    {new Date(document.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1.5" />
                                    Xem {numPages} trang
                                </div>
                            </div>
                            <Separator className="my-6" />
                            <div className="prose max-w-none text-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả tài liệu</h3>
                                <p className="whitespace-pre-line leading-relaxed">
                                    {document.description || 'Chưa có mô tả.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <div className="mb-6">
                                    <div className="text-3xl font-bold text-primary mb-1">
                                        {isFree ? 'Miễn phí' : `${document.price?.amount.toLocaleString()} đ`}
                                    </div>
                                    <div className="text-sm text-gray-500">{canViewFull ? 'Bạn đã sở hữu tài liệu này' : 'Thanh toán một lần'}</div>
                                </div>

                                <div className="space-y-3">
                                    {canViewFull ? (
                                        <Button className="w-full text-lg h-12 bg-green-600 hover:bg-green-700" size="lg" onClick={() => window.open(document.fileUrl, '_blank')}>
                                            <Download className="mr-2 h-5 w-5" /> Tải xuống
                                        </Button>
                                    ) : (
                                        <>
                                            <Button className="w-full text-lg h-12" size="lg" onClick={buyNow}>
                                                <ShoppingCart className="mr-2 h-5 w-5" /> Mua ngay
                                            </Button>
                                            <Button variant="outline" className="w-full" onClick={addToCart}>
                                                Thêm vào giỏ
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="mt-6 flex items-center justify-center gap-4">
                                    <Button variant="ghost" size="sm" className="text-gray-500">
                                        <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
                                    </Button>
                                </div>
                            </div>

                            {/* Author Profile */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Đăng bởi</h3>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${document.author?.fullName}`} />
                                        <AvatarFallback><UserIcon /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-gray-900">{document.author?.fullName || 'Người dùng ẩn danh'}</div>
                                        <div className="text-xs text-gray-500">Tham gia từ 2024</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="font-bold text-gray-900">12</div>
                                        <div className="text-xs text-gray-500">Tài liệu</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-4">
                                    Xem hồ sơ
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
