'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, File, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'; // Handled by apiFetch

interface Category {
    id: string;
    name: string;
}

export default function UploadPage() {
    const router = useRouter();
    // PDF File State
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

    // Preview Image State
    const [previewImage, setPreviewImage] = useState<File | null>(null);
    const [uploadingPreview, setUploadingPreview] = useState(false);
    const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
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
        apiFetch<Category[]>('/categories')
            .then((data) => setCategories(data))
            .catch((err) => console.error('Failed to fetch categories', err));
    }, []);

    const handleFileUpload = async (fileToUpload: File, isPreview: boolean = false) => {
        if (!fileToUpload) return;

        if (isPreview) {
            setPreviewImage(fileToUpload);
            setUploadingPreview(true);
        } else {
            setFile(fileToUpload);
            setUploading(true);
        }
        setError(null);

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            const data = await apiFetch<{ url: string }>('/documents/upload', {
                method: 'POST',
                body: formData,
                // apiFetch handles Authorization if key is 'accessToken'
            });

            if (isPreview) {
                setUploadedAvatarUrl(data.url);
            } else {
                setUploadedFileUrl(data.url);
            }

        } catch (err: any) {
            setError(err.message || 'Upload failed');
            if (isPreview) {
                setPreviewImage(null);
            } else {
                setFile(null);
            }
        } finally {
            if (isPreview) {
                setUploadingPreview(false);
            } else {
                setUploading(false);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0], false);
        }
    };

    const handlePreviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0], true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadedFileUrl) {
            setError('Vui lòng tải lên tài liệu trước.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await apiFetch('/documents', {
                method: 'POST',
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price) || 0,
                    categoryId: formData.categoryId,
                    fileUrl: uploadedFileUrl,
                    avatar: uploadedAvatarUrl, // Send as avatar
                }),
                // apiFetch handles Content-Type and Authorization
            });

            alert('Đăng bán tài liệu thành công!');
            router.push('/seller/documents');
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
                            <Label>Tệp tài liệu (PDF, Word, Excel, PowerPoint) <span className="text-red-500">*</span></Label>
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${file ? 'border-green-500 bg-green-50/30' : 'border-gray-300 hover:border-primary/50'}`}>
                                {!file ? (
                                    <label className="cursor-pointer block w-full h-full">
                                        <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                            Nhấn để tìm tài liệu
                                        </span>
                                        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFileChange} />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <File className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="text-left overflow-hidden max-w-[200px]">
                                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{uploading ? 'Đang tải...' : 'Đã tải lên'}</p>
                                            </div>
                                        </div>
                                        {!uploading && (
                                            <Button variant="ghost" size="sm" type="button" onClick={() => { setFile(null); setUploadedFileUrl(null); }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Avatar Image Upload Area */}
                        <div className="space-y-2">
                            <Label>Ảnh bìa (Tùy chọn)</Label>
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${previewImage ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400/50'}`}>
                                {!previewImage ? (
                                    <label className="cursor-pointer block w-full h-full flex flex-col items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Thêm ảnh bìa (JPG, PNG)</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePreviewImageChange} />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {/* If uploadedAvatarUrl exists, show image preview, else show icon */}
                                            {uploadedAvatarUrl ? (
                                                <img src={uploadedAvatarUrl} alt="Preview" className="h-12 w-12 object-cover rounded" />
                                            ) : (
                                                <div className="bg-blue-100 p-2 rounded-full">
                                                    <ImageIcon className="h-6 w-6 text-blue-600" />
                                                </div>
                                            )}
                                            <div className="text-left overflow-hidden max-w-[200px]">
                                                <p className="text-sm font-medium text-gray-900 truncate">{previewImage.name}</p>
                                                <p className="text-xs text-gray-500">{uploadingPreview ? 'Đang tải...' : 'Đã tải lên'}</p>
                                            </div>
                                        </div>
                                        {!uploadingPreview && (
                                            <Button variant="ghost" size="sm" type="button" onClick={() => { setPreviewImage(null); setUploadedAvatarUrl(null); }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Tiêu đề tài liệu <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                placeholder="VD: Giáo án Toán 12 Học kì 1 - Cánh Diều"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>



                        {/* Submitting Overlay */}
                        {submitting && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
                                    <p className="text-sm font-medium text-gray-700">Đang đăng bán...</p>
                                </div>
                            </div>
                        )}

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Danh mục <span className="text-red-500">*</span></Label>
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

                        <Button type="submit" className="w-full" size="lg" disabled={submitting || uploading || uploadingPreview || !uploadedFileUrl}>
                            {submitting ? 'Đang đăng...' : 'Đăng bán tài liệu'}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
