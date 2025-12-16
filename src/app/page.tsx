'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarMenu } from '@/components/sidebar-menu';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Will need to create Badge or remove
import { Search, BookOpen, Download, Star, Filter, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

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
  avatar?: string;
  createdAt: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredDocs, setFeaturedDocs] = useState<Document[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest'); // 'newest' | 'popular'
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

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
    // Fetch Categories
    apiFetch<Category[]>('/categories')
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', '12');

        if (sort === 'popular') {
          queryParams.append('sort', 'views');
          queryParams.append('order', 'DESC');
        } else {
          queryParams.append('sort', 'createdAt');
          queryParams.append('order', 'DESC');
        }

        if (appliedSearch) {
          queryParams.append('search', appliedSearch);
        }

        const response = await apiFetch<any>(`/documents?${queryParams.toString()}`);
        setFeaturedDocs(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.totalPages);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      }
    };

    fetchDocuments();
  }, [page, sort, appliedSearch]);

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setAppliedSearch(searchTerm);
                    setPage(1);
                    document.getElementById('featured-docs')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="h-14 w-full rounded-full border-0 bg-white pl-12 pr-32 text-gray-900 shadow-xl ring-2 ring-transparent transition placeholder:text-gray-500 focus:ring-primary focus:outline-none"
              />
              <Button
                size="lg"
                className="absolute right-2 rounded-full px-6"
                onClick={() => {
                  setAppliedSearch(searchTerm);
                  setPage(1);
                  document.getElementById('featured-docs')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Tìm kiếm
              </Button>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4 text-sm text-slate-400">
            <span>Phổ biến:</span>
            <button onClick={() => { setSearchTerm('Toán 12'); setAppliedSearch('Toán 12'); setPage(1); document.getElementById('featured-docs')?.scrollIntoView({ behavior: 'smooth' }); }} className="underline hover:text-white">Toán 12</button>
            <button onClick={() => { setSearchTerm('Ngữ Văn 10'); setAppliedSearch('Ngữ Văn 10'); setPage(1); document.getElementById('featured-docs')?.scrollIntoView({ behavior: 'smooth' }); }} className="underline hover:text-white">Ngữ Văn 10</button>
            <button onClick={() => { setSearchTerm('Tiếng Anh'); setAppliedSearch('Tiếng Anh'); setPage(1); document.getElementById('featured-docs')?.scrollIntoView({ behavior: 'smooth' }); }} className="underline hover:text-white">Tiếng Anh</button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 flex gap-6 pt-8">
        {/* Sidebar Menu */}
        <SidebarMenu />

        {/* Main Content Area */}
        <div className="flex-1">


          {/* Featured Documents Section */}
          <section className="pb-16" id="featured-docs">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {appliedSearch ? `Kết quả tìm kiếm cho: "${appliedSearch}"` : 'Tài liệu nổi bật'}
              </h2>
              <div className="flex gap-2">
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredDocs.length > 0 ? featuredDocs.map((doc) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 flex flex-col h-full">
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
              )) : (
                <p className="col-span-full text-center text-gray-500">Chưa tìm thấy tài liệu nào. Hãy là người đầu tiên tải lên!</p>
              )}
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
          </section>
        </div>
      </div>
    </div>
  );
}
