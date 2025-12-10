'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, MoreHorizontal, Edit, Trash } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    status: string;
    price: { amount: number } | null;
    createdAt: string;
    // downloads: number; // to be implemented
    // revenue: number;   // to be implemented
}

export default function SellerDashboard() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch only seller's documents (requires auth context & API update)
        // For now, fetching all for demo
        fetch('http://localhost:4000/documents')
            .then(res => res.json())
            .then(data => {
                setDocuments(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Seller Dashboard</h1>
                        <p className="text-gray-500">Manage your documents and track your sales.</p>
                    </div>
                    <Link href="/seller/upload">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Upload New
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview (Mock) */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <span className="text-xs text-muted-foreground font-bold">VND</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0 đ</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{documents.length}</div>
                            <p className="text-xs text-muted-foreground">Traffic is up</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Documents List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Your Documents</CardTitle>
                        <CardDescription>
                            A list of your uploaded documents and their status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                You haven't uploaded any documents yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Link href={`/documents/${doc.id}`} className="font-medium hover:underline text-gray-900">
                                                    {doc.title}
                                                </Link>
                                                <div className="flex items-center text-sm text-gray-500 gap-2">
                                                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{doc.price && doc.price.amount > 0 ? `${doc.price.amount.toLocaleString()} đ` : 'Free'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                                                {doc.status || 'Pending'}
                                            </Badge>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4 text-gray-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
