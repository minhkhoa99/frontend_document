'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SidebarMenu } from '@/components/sidebar-menu';
import { apiFetch } from '@/lib/api'; // Import apiFetch
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, FileText, Download, Calendar, Search, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    createdAt: string;
    price?: { amount: number };
    author?: { fullName: string };
    category?: { name: string; slug: string };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    children?: Category[];
    parent?: Category;
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [category, setCategory] = useState<Category | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [fileTypes, setFileTypes] = useState<string[]>([]);

    const toggleFileType = (type: string) => {
        setFileTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
        setPage(1);
    };

    // Debounce search
    useEffect(() => {
        // Reset page when search changes (optional but good UX)
        if (search !== debouncedSearch) setPage(1);

        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

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
        if (!slug) return;

        const findCategory = async () => {
            setLoading(true);
            try {
                // Fetch Category Tree to find ID
                const categoriesTree: any = await apiFetch('/categories/tree');

                const findCategoryBySlug = (items: Category[], targetSlug: string): Category | null => {
                    for (const item of items) {
                        if (item.slug === targetSlug) return item;
                        if (item.children) {
                            const found = findCategoryBySlug(item.children, targetSlug);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const foundCategory = findCategoryBySlug(categoriesTree, slug);
                if (foundCategory) {
                    setCategory(foundCategory);
                } else {
                    // Fallback or 404
                    setCategory({ id: '', name: slug.replace(/-/g, ' ').toUpperCase(), slug: slug, children: [] });
                }
            } catch (error) {
                console.error("Failed to fetch category info", error);
            }
        };

        findCategory();
    }, [slug]);

    useEffect(() => {
        if (!category?.id) return;

        const fetchDocs = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('limit', '12'); // Grid usually 4 cols, so 12 is good
                queryParams.append('categoryIds', category.id);
                if (debouncedSearch) {
                    queryParams.append('search', debouncedSearch);
                }
                if (fileTypes.length > 0) {
                    queryParams.append('fileTypes', fileTypes.join(','));
                }

                const response: any = await apiFetch(`/documents?${queryParams.toString()}`);
                setDocuments(response.data || []);
                if (response.meta) {
                    setTotalPages(response.meta.totalPages);
                }
            } catch (error) {
                console.error("Failed to fetch documents", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDocs();
    }, [category?.id, page, debouncedSearch, fileTypes]);

    return (
        <div className="container mx-auto px-4 py-8 flex gap-8">
            {/* Sidebar (Reused) */}
            <aside className="w-64 shrink-0 hidden lg:block sticky top-16 self-start">
                <SidebarMenu />

                {/* File Type Filter Section */}
                <div className="mt-8 p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-800">Định dạng</h3>
                    <div className="flex flex-wrap gap-2">
                        {['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].map((type) => (
                            <Button
                                key={type}
                                variant={fileTypes.includes(type) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleFileType(type)}
                                className={`text-xs uppercase ${fileTypes.includes(type) ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="border-b pb-2 flex-1 w-full">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category?.name || 'Loading...'}</h1>
                        <p className="text-gray-500">Danh sách tài liệu thuộc danh mục <span className="font-medium text-blue-600">{category?.name}</span></p>
                    </div>

                    <div className="relative w-full sm:w-72 mt-4 sm:mt-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài liệu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                {/* Subcategories (if any) - Keeping existing logic */}
                {category?.children && category.children.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Danh mục con</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {category.children.map((child) => (
                                <Link key={child.id} href={`/categories/${child.slug}`}>
                                    <div className="block p-4 border rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition-all text-center">
                                        <div className="font-medium text-blue-700">{child.name}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                        <p>Đang tải tài liệu...</p>
                    </div>
                ) : documents.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {documents.map((doc: any) => (
                                <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 flex flex-col h-full bg-white group">
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                        {doc.avatar || doc.fileUrl?.endsWith('.pdf') ? (
                                            // Avatar or Placeholder logic
                                            doc.avatar ? (
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
                                            )
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50">
                                                <FileText size={48} className="opacity-20" />
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
                                            <span className="font-bold text-blue-600 text-lg">
                                                {doc.price && doc.price.amount > 0 ? `${doc.price.amount.toLocaleString()} đ` : 'Miễn phí'}
                                            </span>
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

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="h-9 w-9 rounded-md border-gray-200"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                                    .map((p, i, arr) => (
                                        <div key={p} className="flex items-center">
                                            {i > 0 && p > arr[i - 1] + 1 && <span className="mx-1 text-gray-400">...</span>}
                                            <Button
                                                variant={page === p ? 'default' : 'outline'}
                                                size="icon"
                                                onClick={() => setPage(p)}
                                                className={`h-9 w-9 rounded-md ${page === p ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {p}
                                            </Button>
                                        </div>
                                    ))}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="h-9 w-9 rounded-md border-gray-200"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <FileText size={48} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Chưa có tài liệu</h3>
                        <p className="text-gray-500 mt-1">Chưa có tài liệu nào trong danh mục này.</p>
                        {(!category?.children || category.children.length === 0) && (
                            <Button variant="link" className="mt-4 text-blue-600" asChild>
                                <Link href="/">Quay lại trang chủ</Link>
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div >
    );
}
