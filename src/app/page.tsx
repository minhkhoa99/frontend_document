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
import { ContentBlocks } from '@/components/content-blocks';

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
          {/* Dynamic Content Blocks */}
          <div className="py-8">
            <ContentBlocks />
          </div>
        </div>
      </div>
    </div>
  );
}

