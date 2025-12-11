'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SidebarMenu } from '@/components/sidebar-menu';
import { BookOpen } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    children?: Category[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Using simple categories fetch or tree fetch depending on what backend provides
        // For "Browse by Category" usually flat list or main parents are shown
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(`${apiUrl}/categories/tree`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Error fetching categories:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 flex gap-8">
            <div className="hidden lg:block w-64 shrink-0">
                <SidebarMenu />
            </div>

            <main className="flex-1">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Danh mục tài liệu</h1>
                <p className="text-gray-500 mb-8">Khám phá kho tàng tài liệu giảng dạy phong phú được sắp xếp theo cấp học và môn học.</p>

                {loading ? (
                    <div className="text-center py-20">Đang tải...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat) => (
                            <Link key={cat.id} href={`/categories/${cat.slug}`} className="block h-full">
                                <div className="group h-full relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-primary/50">
                                    <div className="mb-4 h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary mb-2">{cat.name}</h3>
                                    {/* Show subcategories hint if any */}
                                    {cat.children && cat.children.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {cat.children.slice(0, 3).map(child => (
                                                <span key={child.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                    {child.name}
                                                </span>
                                            ))}
                                            {cat.children.length > 3 && (
                                                <span className="text-xs text-gray-400 self-center">+{cat.children.length - 3} more</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
