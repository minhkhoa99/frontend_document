'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, UploadCloud, File, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { apiFetch, API_URL } from '@/lib/api';
import { Upload, message } from 'antd';
import ImgCrop from 'antd-img-crop';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
// const API_URL = ... (managed by apiFetch)

interface Category {
    id: string;
    name: string;
}

const configThumbTopic = {
    upload: [
        { width: 800, height: 600 },
    ],
};
const config_size = JSON.stringify(configThumbTopic.upload);

export default function EditDocumentPage() {
    const router = useRouter();
    const params = useParams(); // Should contain id
    const docId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // PDF File State
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [newFileUrl, setNewFileUrl] = useState<string | null>(null);

    // Avatar Image State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '',
    });

    useEffect(() => {
        // Fetch categories
        // Fetch categories
        apiFetch<Category[]>('/categories')
            .then((data) => setCategories(data))
            .catch((err) => console.error('Failed to fetch categories', err));
    }, []);

    useEffect(() => {
        if (!docId) return;
        fetchDocument();
    }, [docId]);

    const fetchDocument = async () => {
        try {
            // Fetch document details via apiFetch
            const doc = await apiFetch<any>(`/documents/${docId}`);

            setFormData({
                title: doc.title,
                description: doc.description || '',
                price: doc.price ? doc.price.amount.toString() : '0',
                categoryId: doc.category ? doc.category.id : '',
            });
            setCurrentAvatar(doc.avatar || null);

        } catch (err) {
            console.error(err);
            setError('Không tìm thấy tài liệu hoặc lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (fileToUpload: File, isAvatar: boolean = false) => {
        if (!fileToUpload) return;

        if (isAvatar) {
            setAvatarFile(fileToUpload);
            setUploadingAvatar(true);
        } else {
            setFile(fileToUpload);
            setUploading(true);
        }
        setError(null);

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            // Upload using apiFetch, allowing it to handle headers (except Content-Type for FormData)
            // NOTE: fetch automatically sets Content-Type to multipart/form-data with boundary when body is FormData
            // We need to tell apiFetch NOT to set 'Content-Type': 'application/json'

            // Actually, my apiFetch sets application/json by default.
            // I should override it.
            const data = await apiFetch<any>('/documents/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    // Overwriting Content-Type to undefined lets browser set it with boundary
                    'Content-Type': undefined as any
                }
            });

            if (isAvatar) {
                setNewAvatarUrl(data.url);
            } else {
                setNewFileUrl(data.url);
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            if (isAvatar) {
                setAvatarFile(null);
            } else {
                setFile(null);
            }
        } finally {
            if (isAvatar) {
                setUploadingAvatar(false);
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

    // Antd Upload Handlers
    const [loadingAvatar, setLoadingAvatar] = useState(false);

    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên file JPG/PNG/WEBP!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Hình ảnh phải nhỏ hơn 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleAvatarChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setLoadingAvatar(true);
            return;
        }
        if (info.file.status === 'done') {
            setLoadingAvatar(false);
            const response = info.file.response;
            if (response && response.success && response.data && response.data.url) {
                setNewAvatarUrl(response.data.url);
                message.success('Tải ảnh bìa thành công');
            } else if (response && response.url) {
                setNewAvatarUrl(response.url);
                message.success('Tải ảnh bìa thành công');
            } else {
                message.error('Lỗi tải ảnh bìa');
            }
        }
        if (info.file.status === 'error') {
            setLoadingAvatar(false);
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {


            const payload: any = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                categoryId: formData.categoryId,
            };

            if (newFileUrl) {
                payload.fileUrl = newFileUrl;
            }
            if (newAvatarUrl) {
                payload.avatar = newAvatarUrl;
            }

            await apiFetch(`/seller/documents/${docId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });

            alert('Cập nhật tài liệu thành công!');
            router.push('/seller/documents');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Đang tải...</div>;
    if (!docId) return <div className="p-10 text-center">Không tìm thấy ID tài liệu</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <Card className="w-full max-w-2xl shadow-lg border-0 bg-white">
                <CardHeader>
                    <div className="flex items-center mb-4">
                        <Link href="/seller/documents" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="h-5 w-5 mr-2 inline" /> Quay lại
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Chỉnh sửa tài liệu</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* File Upload Update */}
                        <div className="space-y-2">
                            <Label>Cập nhật tệp tài liệu - <span className="text-gray-500 font-normal">Để trống nếu không thay đổi</span></Label>
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${file ? 'border-green-500 bg-green-50/30' : 'border-gray-300 hover:border-primary/50'}`}>
                                {!file ? (
                                    <label className="cursor-pointer block w-full h-full">
                                        <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                        <div className="mt-2 text-sm text-gray-900">
                                            <p className="font-medium text-blue-600 mb-1 line-clamp-1 px-4">
                                                File hiện tại: {formData.title}
                                            </p>
                                            <p>Nhấn để chọn tệp mới nếu muốn thay thế</p>
                                        </div>
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
                                                <p className="text-xs text-gray-500">New file</p>
                                            </div>
                                        </div>
                                        {uploading ? (
                                            <span className="text-sm font-bold text-primary animate-pulse">Đang tải lên...</span>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setNewFileUrl(null); }} type="button">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Avatar Upload Update */}
                        <div className="space-y-2">
                            <Label>Cập nhật ảnh bìa - <span className="text-gray-500 font-normal">Để trống nếu không thay đổi</span></Label>
                            <div className="border border-gray-200 rounded-lg p-4 flex justify-center">
                                <ImgCrop rotate aspect={800 / 600} quality={1} fillColor="transparent">
                                    <Upload
                                        name="file"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        showUploadList={false}
                                        action={`${API_URL}/documents/upload?configThumString=${config_size}`}
                                        beforeUpload={beforeUpload}
                                        onChange={handleAvatarChange}
                                        headers={{
                                            Authorization: `Bearer ${Cookies.get('accessToken')}`
                                        }}
                                    >
                                        {loadingAvatar ? (
                                            <div>
                                                <LoadingOutlined />
                                                <div style={{ marginTop: 8 }}>Đang tải...</div>
                                            </div>
                                        ) : (
                                            newAvatarUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={newAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                currentAvatar ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={currentAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div>
                                                        <PlusOutlined />
                                                        <div style={{ marginTop: 8 }}>Upload</div>
                                                    </div>
                                                )
                                            )
                                        )}
                                    </Upload>
                                </ImgCrop>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Tiêu đề tài liệu</Label>
                            <Input
                                id="title"
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
                            <Label htmlFor="description">Mô tả chi tiết</Label>
                            <Textarea
                                id="description"
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

                        <Button type="submit" className="w-full" size="lg" disabled={submitting || uploading || uploadingAvatar}>
                            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
