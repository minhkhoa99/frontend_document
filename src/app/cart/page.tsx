'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem {
    id: string;
    document: {
        id: string;
        title: string;
        fileUrl: string;
        price: { amount: number; currency: string } | null;
    };
}

interface Cart {
    id: string;
    items: CartItem[];
}

export default function CartPage() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch('http://localhost:4000/cart', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            } else {
                console.error('Failed to fetch cart');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:4000/cart/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                fetchCart(); // Refresh
            }
        } catch (err) {
            console.error(err);
        }
    };

    const checkout = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:4000/orders/checkout', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                alert('Checkout successful! Documents are now available.');
                router.push('/profile'); // or /my-documents
            } else {
                const err = await res.json();
                alert(`Checkout failed: ${err.message}`);
            }
        } catch (err) {
            console.error(err);
            alert('Checkout error');
        }
    }

    if (loading) return <div className="p-10 text-center">Loading cart...</div>;
    if (!cart) return <div className="p-10 text-center">Please login to view cart</div>;

    const total = cart.items.reduce((sum, item) => {
        const price = item.document.price ? Number(item.document.price.amount) : 0;
        return sum + price;
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-primary" /> Shopping Cart
                </h1>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {cart.items.length === 0 ? (
                            <Card>
                                <CardContent className="p-10 text-center text-gray-500">
                                    Your cart is empty. <Link href="/" className="text-primary underline">Browse documents</Link>
                                </CardContent>
                            </Card>
                        ) : (
                            cart.items.map((item) => (
                                <Card key={item.id} className="flex items-center p-4 gap-4">
                                    <div className="h-16 w-16 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-xs text-gray-500">
                                        PDF
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{item.document.title}</h3>
                                        <p className="text-sm text-gray-500">PDF Document</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">
                                            {item.document.price?.amount ? `${Number(item.document.price.amount).toLocaleString()} đ` : 'Free'}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 h-auto p-0 mt-1"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">{total.toLocaleString()} đ</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Taxes</span>
                                    <span className="font-medium">0 đ</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>{total.toLocaleString()} đ</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg" onClick={checkout} disabled={cart.items.length === 0}>
                                    pCheckout <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
