'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Eye, Download, ShoppingCart, Share2, Flag, FileText, Calendar, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Document {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    price: { amount: number; currency: string } | null;
    author: { fullName: string; id: string } | null;
    category: { name: string; slug: string } | null;
    totalPage: number;
    createdAt: string;
}

export default function DocumentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            apiFetch<Document>(`/documents/${id}`)
                .then((data) => {
                    setDocument(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch document', err);
                    setLoading(false);
                });
        }
    }, [id]);

    const addToCart = async () => {
        // Auth check handled by apiFetch (will redirect to login if 401)

        if (!document) return;

        try {
            await apiFetch('/cart', {
                method: 'POST',
                body: JSON.stringify({ documentId: document.id }),
            });

            alert('Added to cart!');
        } catch (err) {
            alert('Failed to add to cart (maybe already added?)');
            console.error(err);
        }
    };

    const buyNow = async () => {
        await addToCart();
        router.push('/cart');
    };

    if (loading) return <div className="text-center py-20">Loading document...</div>;
    if (!document) return <div className="text-center py-20">Document not found</div>;

    const isFree = !document.price || document.price.amount === 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb - Simplified */}
                <div className="mb-6 text-sm text-gray-500">
                    <Link href="/" className="hover:text-primary">Home</Link> /
                    <Link href="/categories" className="hover:text-primary"> Categories</Link> /
                    <span className="text-gray-900 font-medium ml-1 truncate">{document.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Preview & Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Preview Area */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-100 aspect-[16/9] flex items-center justify-center relative">
                                <div className="text-center p-8">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700">Preview not available</h3>
                                    <p className="text-sm text-gray-500">The preview for this document is being processed.</p>
                                </div>
                            </div>
                            <div className="p-4 border-t bg-gray-50 flex justify-between text-sm text-gray-500">
                                <span>Page 1 of {document.totalPage || '?'}</span>
                                <Button variant="link" size="sm" className="h-auto p-0">View Fullscreen</Button>
                            </div>
                        </div>

                        {/* Description & Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{document.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                    {document.category?.name || 'Uncategorized'}
                                </Badge>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1.5" />
                                    {new Date(document.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1.5" />
                                    1,234 views
                                </div>
                                <div className="flex items-center">
                                    <Flag className="h-4 w-4 mr-1.5" />
                                    Report
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="prose max-w-none text-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                <p className="whitespace-pre-line leading-relaxed">
                                    {document.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar (Purchase/Download) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Purchase Card */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <div className="mb-6">
                                    <div className="text-3xl font-bold text-primary mb-1">
                                        {isFree ? 'Free' : `${document.price?.amount.toLocaleString()} đ`}
                                    </div>
                                    <div className="text-sm text-gray-500">One-time purchase</div>
                                </div>

                                <div className="space-y-3">
                                    <Button className="w-full text-lg h-12" size="lg" onClick={buyNow}>
                                        {isFree ? (
                                            <>
                                                <Download className="mr-2 h-5 w-5" /> Download Now
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now
                                            </>
                                        )}
                                    </Button>
                                    {!isFree && (
                                        <Button variant="outline" className="w-full" onClick={addToCart}>
                                            Add to Cart
                                        </Button>
                                    )}
                                </div>
                                <div className="mt-6 flex items-center justify-center gap-4">
                                    <Button variant="ghost" size="sm" className="text-gray-500">
                                        <Share2 className="h-4 w-4 mr-2" /> Share
                                    </Button>
                                </div>
                            </div>

                            {/* Author Profile */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Uploaded by</h3>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${document.author?.fullName}`} />
                                        <AvatarFallback><UserIcon /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-gray-900">{document.author?.fullName || 'Unknown User'}</div>
                                        <div className="text-xs text-gray-500">Member since 2024</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="font-bold text-gray-900">12</div>
                                        <div className="text-xs text-gray-500">Uploads</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">4.8</div>
                                        <div className="text-xs text-gray-500">Rating</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-4">
                                    View Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
