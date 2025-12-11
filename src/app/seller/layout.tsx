
import { SellerSidebar } from '@/components/seller-sidebar';

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SellerSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header could go here */}
                <header className="lg:hidden h-16 bg-white border-b flex items-center px-4">
                    <span className="font-bold text-lg">Kênh Người Bán</span>
                    {/* Add hamburger menu trigger here if needed */}
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
