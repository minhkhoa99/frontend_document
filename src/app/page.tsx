'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarMenu } from '@/components/sidebar-menu';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Will need to create Badge or remove
import { Search, BookOpen, Download, Star, Filter } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  // docCount?: number; 
}

interface Document {
  id: string;
  title: string;
  price: { amount: number; currency: string } | null;
  author: { fullName: string } | null;
  category: { name: string } | null;
  fileUrl: string;
  createdAt: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredDocs, setFeaturedDocs] = useState<Document[]>([]);

  useEffect(() => {
    // Fetch Categories
    fetch('http://localhost:4000/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));

    // Fetch Featured/Recent Documents
    fetch('http://localhost:4000/documents')
      .then(res => res.json())
      .then(data => setFeaturedDocs(data)) // Assuming returns list
      .catch(err => console.error('Error fetching documents:', err));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Google cho <span className="text-primary">Tài liệu Giảng dạy</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Tìm kiếm giáo án, đề thi, và slide bài giảng chất lượng cao được chia sẻ bởi hàng ngàn giáo viên.
            Hoặc chia sẻ tài liệu của bạn để kiếm thêm thu nhập.
          </p>

          <div className="mx-auto mt-10 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo môn học, lớp, hoặc chủ đề..."
                className="h-14 w-full rounded-full border-0 bg-white pl-12 pr-4 text-gray-900 shadow-xl ring-2 ring-transparent transition placeholder:text-gray-500 focus:ring-primary focus:outline-none"
              />
              <Button size="lg" className="absolute right-2 rounded-full px-6">
                Tìm kiếm
              </Button>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4 text-sm text-slate-400">
            <span>Phổ biến:</span>
            <Link href="/search?q=Math" className="underline hover:text-white">Toán 12</Link>
            <Link href="/search?q=Literature" className="underline hover:text-white">Ngữ Văn 10</Link>
            <Link href="/search?q=English" className="underline hover:text-white">Tiếng Anh</Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 flex gap-6 pt-8">
        {/* Sidebar Menu */}
        <SidebarMenu />

        {/* Main Content Area */}
        <div className="flex-1">


          {/* Featured Documents Section */}
          <section className="pb-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Tài liệu nổi bật</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Mới nhất</Button>
                <Button variant="ghost" size="sm">Phổ biến</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDocs.length > 0 ? featuredDocs.map((doc) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
                  <div className="aspect-[4/5] bg-gray-100 relative group">
                    {/* Placeholder for preview image */}
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">PDF</div>
                        <div className="text-xs">Xem trước</div>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" className="w-full" variant="secondary">Xem chi tiết</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {doc.category?.name || 'Chung'}
                      </span>
                      <div className="flex items-center text-amber-400 text-xs font-bold">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        4.8
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">Bởi {doc.author?.fullName || 'Ẩn danh'}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-lg">
                        {doc.price && doc.price.amount > 0 ? `${doc.price.amount.toLocaleString()} đ` : 'Miễn phí'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <p className="col-span-full text-center text-gray-500">Chưa tìm thấy tài liệu nào. Hãy là người đầu tiên tải lên!</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
