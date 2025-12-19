
'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, ShoppingCart, Star } from 'lucide-react';

interface ContentBlock {
    id: string;
    title: string;
    type: 'LATEST' | 'POPULAR' | 'FEATURED' | 'CATEGORY';
    order: number;
    isVisible: boolean;
    config?: any;
}

interface Document {
    id: string;
    title: string;
    price: { amount: number; currency: string } | null;
    author: { fullName: string } | null;
    category: { name: string } | null;
    fileUrl: string;
    avatar?: string;
    createdAt: string;
    views?: number;
}

export function ContentBlocks() {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [blockData, setBlockData] = useState<Record<string, Document[]>>({});

    useEffect(() => {
        // Fetch active blocks config
        apiFetch<ContentBlock[]>('/content-blocks/active')
            .then(async (data) => {
                setBlocks(data);
                // Fetch content for each block
                data.forEach(async (block) => {
                    fetchBlockContent(block);
                });
            })
            .catch(err => console.error(err));
    }, []);

    const fetchBlockContent = async (block: ContentBlock) => {
        try {
            const limit = block.config?.limit || 4;
            let endpoint = `/documents?limit=${limit}`;

            if (block.type === 'POPULAR') {
                endpoint += '&sort=views&order=DESC';
            } else if (block.type === 'LATEST') {
                endpoint += '&sort=createdAt&order=DESC';
            } else if (block.type === 'CATEGORY' && block.config?.categoryId) {
                endpoint += `&categoryId=${block.config.categoryId}`;
            }

            // 'FEATURED' might need a specific flag in DB or manual selection logic. 
            // For now, let's treat it similar to Popular or just random if we had a random sort.
            // Assuming FEATURED matches 'isFeatured' if we had such field, 
            // or just fallback to Popular for this demo if not implemented.
            if (block.type === 'FEATURED') {
                endpoint += '&sort=views&order=DESC'; // Placeholder behavior
            }

            const res = await apiFetch<any>(endpoint);
            setBlockData(prev => ({
                ...prev,
                [block.id]: res.data || []
            }));
        } catch (error) {
            console.error(`Error fetching data for block ${block.title}`, error);
        }
    };

    const addToCart = async (docId: string) => {
        try {
            await apiFetch('/cart', {
                method: 'POST',
                body: JSON.stringify({ documentId: docId }),
            });
            alert('Đã thêm vào giỏ hàng thành công!');
            window.dispatchEvent(new Event('cartChange'));
        } catch (err: any) {
            if (err.status === 401) {
                if (confirm('Vui lòng đăng nhập để thêm vào giỏ hàng. Đi tới trang đăng nhập?')) {
                    window.location.href = '/login';
                }
            } else {
                alert('Không thể thêm vào giỏ hàng: ' + (err.message || 'Lỗi không xác định'));
            }
        }
    };

    if (blocks.length === 0) return null;

    return (
        <div className="space-y-12">
            {blocks.map(block => {
                const docs = blockData[block.id] || [];
                if (docs.length === 0) return null;

                return (
                    <section key={block.id} className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">
                                {block.title}
                            </h2>
                            <Link href="/documents" className="text-blue-600 hover:underline text-sm font-medium">
                                Xem tất cả &rarr;
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {docs.map((doc) => (
                                <Card key={doc.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                                    <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-100 relative group">
                                        {doc.avatar ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={doc.avatar}
                                                alt={doc.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400">
                                                <BookOpen className="h-12 w-12 opacity-20" />
                                            </div>
                                        )}
                                        {doc.price && doc.price.amount === 0 && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                Miễn phí
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader className="p-4 pb-2">
                                        <div className="text-xs text-blue-600 font-medium mb-1 truncate">
                                            {doc.category?.name || 'Tài liệu chung'}
                                        </div>
                                        <Link href={`/documents/${doc.id}`} className="group">
                                            <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                                                {doc.title}
                                            </h3>
                                        </Link>
                                    </CardHeader>

                                    <CardContent className="p-4 pt-0 flex-grow">
                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                                            <span>Bởi {doc.author?.fullName || 'Ẩn danh'}</span>
                                            <div className="flex items-center">
                                                <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" />
                                                <span>4.5</span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-4 pt-0 border-t bg-gray-50/50 mt-auto">
                                        <div className="flex items-center justify-between w-full pt-3">
                                            <span className="text-lg font-bold text-red-600">
                                                {doc.price && doc.price.amount > 0
                                                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doc.price.amount)
                                                    : 'Miễn phí'}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                                onClick={() => addToCart(doc.id)}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-1" /> Thêm
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
