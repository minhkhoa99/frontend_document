'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, File, X, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Category {
    id: string;
    name: string;
}

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false); // File upload state
    const [submitting, setSubmitting] = useState(false); // Form submit state
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '',
    });

    useEffect(() => {
        // Fetch categories
        fetch(`${API_URL}/categories`)
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error('Failed to fetch categories', err));
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const res = await fetch(`${API_URL}/documents/upload`, {
                    method: 'POST',
                    body: formData,
                    // Note: Multipart upload usually doesn't need Content-Type header manually set, browser does it.
                    // But might need Auth header if upload endpoint is protected.
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                if (!res.ok) throw new Error('File upload failed');

                const data = await res.json();
                setUploadedFileUrl(data.url); // Use the URL returned (should be path or full URL)
                // Note: Backend currently returns 'fileName'. We might need to construct full URL or just send fileName back if Backend expects that.
                // The DTO expects 'fileUrl' as URL. The service `upload` returns `{ url: ..., path: ... }`.
            } catch (err: any) {
                setError(err.message || 'Upload failed');
                setFile(null);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadedFileUrl) {
            setError('Please upload a file first');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price) || 0,
                    categoryId: formData.categoryId,
                    fileUrl: uploadedFileUrl,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to create document');
            }

            router.push('/seller/dashboard'); // Redirect to dashboard (to be created)
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <Card className="w-full max-w-2xl shadow-lg border-0 bg-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">Tải lên tài liệu</CardTitle>
                    <CardDescription>Chia sẻ kiến thức và kiếm thêm thu nhập một cách dễ dàng.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <Label>Tệp tài liệu (PDF)</Label>
                            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${file ? 'border-green-500 bg-green-50/30' : 'border-gray-300 hover:border-primary/50'}`}>
                                {!file ? (
                                    <label className="cursor-pointer block w-full h-full">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                            Nhấn để tải lên hoặc kéo thả vào đây
                                        </span>
                                        <span className="mt-1 block text-xs text-gray-500">
                                            PDF tối đa 50MB
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <File className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        {uploading ? (
                                            <span className="text-xs text-primary animate-pulse">Uploading...</span>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setUploadedFileUrl(null); }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Tiêu đề tài liệu</Label>
                            <Input
                                id="title"
                                placeholder="VD: Giáo án Toán 12 Học kì 1 - Cánh Diều"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Danh mục</Label>
                            <select
                                id="category"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                            >
                                <option value="" disabled>Chọn danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price">Giá bán (VNĐ)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="Nhập 0 để miễn phí"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả chi tiết (Tùy chọn)</Label>
                            <Textarea
                                id="description"
                                placeholder="Mô tả nội dung tài liệu, giúp người mua dễ dàng tìm kiếm..."
                                className="h-32"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" size="lg" disabled={submitting || uploading || !uploadedFileUrl}>
                            {submitting ? 'Đang đăng...' : 'Đăng bán tài liệu'}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
