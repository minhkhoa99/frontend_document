'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
// ... (imports)
// Removed RadioGroup import

// ...

{/* Levels (Simulated) */ }
<div>
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">CẤP HỌC</h3>
    <div className="space-y-3">
        {['Tiểu học', 'Trung học cơ sở', 'Trung học phổ thông', 'Đại học'].map((level, idx) => (
            <div key={idx} className="flex items-center space-x-3">
                <input
                    type="radio"
                    name="level"
                    id={`level-${idx}`}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <label htmlFor={`level-${idx}`} className="text-sm text-gray-600 cursor-pointer">{level}</label>
            </div>
        ))}
    </div>
</div>
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, Star, GraduationCap, BookOpen, FileText, ShoppingCart } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

interface Document {
    id: string;
    title: string;
    price: { amount: number; currency: string } | null;
    originalPrice?: number; // Simulated
    author: { fullName: string } | null;
    category: { name: string } | null;
    fileUrl: string;
    avatar?: string;
    createdAt: string;
    rating?: number; // Simulated
    reviewCount?: number; // Simulated
    level?: string; // Simulated
    discountPercentage?: number;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
    const [sort, setSort] = useState<string>('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const toggleCategory = (categoryId: string) => {
        setPage(1);
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleFormat = (format: string) => {
        setPage(1);
        setSelectedFormats(prev =>
            prev.includes(format)
                ? prev.filter(f => f !== format)
                : [...prev, format]
        );
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setSelectedFormats([]);
        setSort('newest');
        setPage(1);
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiFetch<Category[]>('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('limit', '12');

                if (selectedCategories.length > 0) {
                    queryParams.append('categoryIds', selectedCategories.join(','));
                }

                if (selectedFormats.length > 0) {
                    queryParams.append('fileTypes', selectedFormats.join(','));
                }

                if (sort === 'price_asc') {
                    queryParams.append('sort', 'price');
                    queryParams.append('order', 'ASC');
                } else if (sort === 'price_desc') {
                    queryParams.append('sort', 'price');
                    queryParams.append('order', 'DESC');
                } else if (sort === 'popular') {
                    queryParams.append('sort', 'views'); // Backend expects 'views' or 'popular' but let's send 'views' or handled in service
                    queryParams.append('order', 'DESC');
                } else { // newest
                    queryParams.append('sort', 'createdAt');
                    queryParams.append('order', 'DESC');
                }

                const queryString = queryParams.toString();
                const url = `/documents${queryString ? `?${queryString}` : ''}`;

                const response = await apiFetch<any>(url);
                const data = response.data || [];
                const meta = response.meta;

                setTotalPages(meta?.totalPages || 1);

                // Simulate extra data for UI matching (keep existing simulation logic for now as API might not return everything)
                const enhancedData = data.map((doc: any) => ({
                    ...doc,
                    rating: 4.5 + Math.random() * 0.5,
                    reviewCount: Math.floor(Math.random() * 200) + 10,
                    level: ['Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại học'][Math.floor(Math.random() * 4)],
                    originalPrice: doc.price?.amount ? doc.price.amount * 1.2 : 0
                }));
                setDocuments(enhancedData);
            } catch (error) {
                console.error('Error fetching documents:', error);
                setDocuments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
        fetchDocuments();
    }, [searchParams, selectedCategories, selectedFormats, sort, page]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header/Breadcrumb could go here */}

            <div className="container mx-auto px-4 pt-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filter */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
                                <button onClick={handleClearFilters} className="text-xs font-medium text-blue-600 hover:underline">Xóa tất cả</button>
                            </div>

                            <div className="space-y-8">
                                {/* Topics / Categories */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">CHỦ ĐỀ</h3>
                                    <div className="space-y-3">
                                        {categories.map((cat) => (
                                            <div key={cat.id} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`cat-${cat.id}`}
                                                    className="data-[state=checked]:bg-blue-600 border-gray-300"
                                                    checked={selectedCategories.includes(cat.id)}
                                                    onCheckedChange={() => toggleCategory(cat.id)}
                                                />
                                                <label
                                                    htmlFor={`cat-${cat.id}`}
                                                    className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 hover:text-blue-600 cursor-pointer"
                                                >
                                                    {cat.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>



                                {/* Formats */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">ĐỊNH DẠNG</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['PDF', 'DOCX', 'PPTX'].map(fmt => (
                                            <Button
                                                key={fmt}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleFormat(fmt)}
                                                className={`text-xs h-8 ${selectedFormats.includes(fmt)
                                                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                                                    }`}
                                            >
                                                {fmt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Premium Card */}

                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500 hidden sm:block">Hiển thị 1-{documents.length} kết quả</p>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={sort === 'newest' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => { setSort('newest'); setPage(1); }}
                                        className={sort === 'newest' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}
                                    >
                                        Mới nhất
                                    </Button>
                                    <Button
                                        variant={sort === 'popular' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => { setSort('popular'); setPage(1); }}
                                        className={sort === 'popular' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}
                                    >
                                        Phổ biến
                                    </Button>
                                </div>

                                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={sort.includes('price') ? sort : ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setSort(e.target.value);
                                                setPage(1);
                                            }
                                        }}
                                        className="h-9 rounded-md border border-gray-200 bg-white text-sm px-3 outline-none focus:border-blue-500 min-w-[130px]"
                                    >
                                        <option value="" disabled hidden>Sắp xếp giá</option>
                                        <option value="price_asc">Giá thấp đến cao</option>
                                        <option value="price_desc">Giá cao đến thấp</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Documents Grid */}
                        {loading ? (
                            <div className="text-center py-20">Đang tải tài liệu...</div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                                <p className="text-gray-500">Không tìm thấy tài liệu nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {documents.map((doc: Document) => (
                                    <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 flex flex-col h-full bg-white">
                                        <div className="aspect-[4/3] bg-gray-100 relative group overflow-hidden">
                                            {doc.avatar ? (
                                                <img
                                                    src={doc.avatar}
                                                    alt={doc.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50">
                                                    <div className="text-center p-4">
                                                        <div className="text-4xl font-bold mb-2 opacity-20">PDF</div>
                                                        <div className="text-xs uppercase tracking-wider">Xem trước</div>
                                                    </div>
                                                </div>
                                            )}
                                            {doc.discountPercentage && doc.discountPercentage > 0 && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
                                                    -{doc.discountPercentage}%
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <div className="flex gap-2">
                                                    <Link href={`/documents/${doc.id}`} className="w-full">
                                                        <Button size="sm" className="w-full bg-white text-black hover:bg-gray-100" variant="secondary">Xem</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="p-4 flex flex-col flex-1">
                                            <div className="mb-2">
                                                <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold">
                                                    {doc.category?.name || 'Chung'}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 text-base" title={doc.title}>
                                                <Link href={`/documents/${doc.id}`} className="hover:text-blue-600 transition-colors">
                                                    {doc.title}
                                                </Link>
                                            </h3>

                                            <p className="text-sm text-gray-500 mb-4">Bởi {doc.author?.fullName || 'Ẩn danh'}</p>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex flex-col">
                                                    {doc.price && doc.price.amount > 0 ? (
                                                        doc.discountPercentage && doc.discountPercentage > 0 ? (
                                                            <>
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doc.price.amount)}
                                                                </span>
                                                                <span className="font-bold text-red-600 text-lg">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doc.price.amount * (1 - doc.discountPercentage / 100))}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="font-bold text-blue-600 text-lg">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doc.price.amount)}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="font-bold text-green-600 text-lg">Miễn phí</span>
                                                    )}
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-full"
                                                    onClick={() => addToCart(doc.id)}
                                                >
                                                    <ShoppingCart className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="mt-12 flex justify-center">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-md"
                                    disabled={page <= 1}
                                    onClick={() => handlePageChange(page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 1)
                                    .map((p, index, array) => {
                                        const showEllipsis = index > 0 && p - array[index - 1] > 1;
                                        return (
                                            <div key={p} className="flex items-center">
                                                {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                                                <Button
                                                    variant={page === p ? "default" : "outline"}
                                                    size="icon"
                                                    className={`h-9 w-9 rounded-md ${page === p ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-100'}`}
                                                    onClick={() => handlePageChange(p)}
                                                >
                                                    {p}
                                                </Button>
                                            </div>
                                        );
                                    })}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-md hover:bg-gray-100"
                                    disabled={page >= totalPages}
                                    onClick={() => handlePageChange(page + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
