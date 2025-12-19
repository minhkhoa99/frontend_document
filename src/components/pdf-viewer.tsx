'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker to enable PDF rendering
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    fileUrl: string;
    isFree: boolean;
    canViewFull: boolean;
    isPurchased?: boolean;
    price: number;
    buyNow: () => void;
    onPagesLoad?: (numPages: number) => void;
}

export default function PdfViewer({ fileUrl, isFree, canViewFull, price, buyNow, onPagesLoad }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfData, setPdfData] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(800);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let active = true;
        const fetchPdf = async () => {
            try {
                console.log('Fetching PDF from proxy:', fileUrl);
                setFetchError(null);
                const res = await fetch(fileUrl);
                if (!res.ok) throw new Error(`Fetch status: ${res.status}`);
                const blob = await res.blob();
                console.log('Frontend fetched PDF blob:', blob.size, blob.type);

                if (active) {
                    const objectUrl = URL.createObjectURL(blob);
                    setPdfData(objectUrl);
                }
            } catch (err: any) {
                console.error('Error fetching PDF:', err);
                if (active) setFetchError(err.message);
            }
        };
        fetchPdf();
        return () => { active = false; };
    }, [fileUrl]);

    // Handle responsive width
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Subtract padding and margin
                const width = containerRef.current.offsetWidth;
                // Ensure min width
                setContainerWidth(width > 100 ? width - 40 : 300);
            }
        };

        const observer = new ResizeObserver(() => {
            updateWidth();
        });

        if (containerRef.current) {
            updateWidth();
            observer.observe(containerRef.current);
        }

        window.addEventListener('resize', updateWidth);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        if (onPagesLoad) onPagesLoad(numPages);
    };

    const renderPages = () => {
        const pages = [];
        const limitRender = canViewFull ? numPages : Math.min(numPages, 5);

        for (let i = 1; i <= limitRender; i++) {
            let isBlurred = false;

            if (!canViewFull) {
                if (numPages === 1) {
                    isBlurred = true;
                } else if (numPages === 2) {
                    if (i > 1) isBlurred = true;
                } else {
                    if (i > 2) isBlurred = true;
                }
            }

            pages.push(
                <div key={i} className="mb-4 relative shadow-md bg-white">
                    <div className={isBlurred ? "filter blur-sm select-none pointer-events-none opacity-50 transition-all duration-300" : ""}>
                        <Page
                            pageNumber={i}
                            width={containerWidth}
                            renderTextLayer={!isBlurred}
                            renderAnnotationLayer={!isBlurred}
                            className="bg-white mx-auto !max-w-full"
                            error={<div className="p-4 text-red-500">Lỗi hiển thị trang</div>}
                            loading={<div className="p-10 text-center text-gray-400">Đang tải trang {i}...</div>}
                        />
                    </div>
                    {isBlurred && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                            <div className="bg-white/95 p-6 rounded-xl shadow-2xl text-center border border-gray-200 transform scale-100 hover:scale-105 transition-transform duration-200 w-full max-w-sm">
                                <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Nội dung bị khóa</h3>
                                <p className="text-sm text-gray-600 mb-5">
                                    {isFree ? 'Nhận miễn phí để xem đầy đủ' : 'Mua tài liệu để xem đầy đủ nội dung'}
                                </p>
                                <Button onClick={buyNow} size="default" className="w-full font-semibold shadow-lg shadow-primary/20">
                                    {isFree ? 'Nhận miễn phí' : `Mua ngay (${price.toLocaleString()} đ)`}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (!canViewFull && numPages > limitRender) {
            pages.push(
                <div key="more" className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl mt-6">
                    <p className="text-gray-500 mb-4 font-medium">... và còn {numPages - limitRender} trang nữa</p>
                    <Button onClick={buyNow} size="lg" className="px-8">
                        {isFree ? 'Nhận miễn phí để xem toàn bộ' : 'Mua để mở khóa toàn bộ tài liệu'}
                    </Button>
                </div>
            );
        }

        return pages;
    };

    if (fetchError) {
        return <div className="text-red-500">Lỗi tải file: {fetchError}</div>;
    }

    if (!pdfData) {
        return <div className="flex flex-col items-center p-20 min-h-[400px] justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div><p className="text-gray-500">Đang tải dữ liệu PDF...</p></div>;
    }

    return (
        <div ref={containerRef} className="w-full flex flex-col items-center">
            <PdfDocument
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => console.error('PdfDocument load error:', error)}
                loading={<div className="flex flex-col items-center p-20 min-h-[400px] justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div><p className="text-gray-500">Đang hiển thị PDF...</p></div>}
                error={<div className="p-10 text-red-500 bg-red-50 rounded-lg">Không thể hiển thị PDF. Vui lòng xem console để biết chi tiết. {fetchError}</div>}
                className="max-w-full flex flex-col items-center"
            >
                {numPages > 0 ? renderPages() : <div className="p-10 text-gray-500">Đang xử lý {numPages} trang...</div>}
            </PdfDocument>
        </div>
    );
}
