'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SidebarMenu } from '@/components/sidebar-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, FileText, Download, Calendar } from 'lucide-react';

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

    useEffect(() => {
        if (!slug) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

                // 1. Fetch Documents
                // In a real app, you'd use: GET /documents?categorySlug=${slug}
                // For this prototype, we fetch all and filter client-side to match the user's "Display documents by category" request immediately.
                const docsRes = await fetch(`${apiUrl}/documents`);
                const allDocs = await docsRes.json();

                // Mock Filter Logic: Match slug in category name or slug property
                // Logic: If doc.category.slug === slug OR doc.category.name (normalized) === slug
                const filteredDocs = allDocs.filter((d: any) => {
                    // Normalize slug for comparison if needed
                    const catSlug = d.category?.slug || '';
                    // Check if document belongs to this category
                    return catSlug === slug;
                });
                setDocuments(filteredDocs);

                // 2. Fetch Category Info to get Children
                // Since we don't have a direct "get by slug" endpoint that returns children, we'll fetch the tree and traverse it.
                // This is a temporary solution until the backend provides a more specific endpoint.
                const categoriesRes = await fetch(`${apiUrl}/categories/tree`);
                const categoriesTree = await categoriesRes.json();

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
                    setCategory({ id: 'mock-id', name: slug.replace(/-/g, ' ').toUpperCase(), slug: slug, children: [] });
                }

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    return (
        <div className="container mx-auto px-4 py-8 flex gap-8">
            {/* Sidebar (Reused) */}
            <aside className="w-64 shrink-0 hidden lg:block sticky top-16 self-start">
                <SidebarMenu />

                {/* File Type Filter Section */}
                <div className="mt-8 p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-800">Định dạng file</h3>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="pdf" defaultChecked />
                            <label htmlFor="pdf" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                PDF
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="docx" defaultChecked />
                            <label htmlFor="docx" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Word (DOCX)
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="pptx" defaultChecked />
                            <label htmlFor="pptx" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                PowerPoint (PPTX)
                            </label>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{category?.name || 'Đang tải...'}</h1>
                    <p className="text-gray-500">Danh sách tài liệu thuộc danh mục <span className="font-medium text-blue-600">{category?.name}</span></p>
                </div>

                {/* Subcategories (if any) */}
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
                    <div className="grid grid-cols-1 gap-4">
                        {documents.map((doc) => (
                            <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                                <CardContent className="p-4 flex gap-4">
                                    <div className="h-24 w-20 bg-gray-50 rounded border flex items-center justify-center shrink-0 text-gray-400 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                                        {/* Dynamic Icon could be used here */}
                                        <FileText size={32} className="text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/documents/${doc.id}`} className="block">
                                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1 mb-1">
                                                {doc.title}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{doc.description}</p>
                                        <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500">
                                            <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                                {doc.category?.name || 'Chưa phân loại'}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar size={12} className="mr-1" /> {new Date(doc.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center text-amber-500 font-medium">
                                                <Star size={12} className="mr-1 fill-current" /> 4.5
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between items-end pl-4 border-l">
                                        <span className="font-bold text-lg text-green-600">
                                            {doc.price && doc.price.amount > 0 ? `${doc.price.amount.toLocaleString()} đ` : 'Miễn phí'}
                                        </span>
                                        <Button size="sm" variant="outline" className="w-full">
                                            <Download size={14} className="mr-2" /> Tải
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <FileText size={48} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Chưa có tài liệu</h3>
                        <p className="text-gray-500 mt-1">Chưa có tài liệu nào trong danh mục này.</p>
                        {/* Only show 'Back to Home' if there are no subcategories either */}
                        {(!category?.children || category.children.length === 0) && (
                            <Button variant="link" className="mt-4 text-blue-600" asChild>
                                <Link href="/">Quay lại trang chủ</Link>
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
