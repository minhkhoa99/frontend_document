import { FileText, FileSpreadsheet, FileIcon, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePlaceholderProps {
    fileUrl: string; // Not used for preview directly, maybe for download
    extension: string;
    isFree: boolean;
    canViewFull: boolean;
    price: number;
    buyNow: () => void;
}

export default function FilePlaceholder({ extension, isFree, canViewFull, price, buyNow, fileUrl }: FilePlaceholderProps) {
    const getIcon = () => {
        switch (extension.toLowerCase()) {
            case 'doc':
            case 'docx':
                return <FileText className="h-24 w-24 text-blue-600 mb-4" />;
            case 'xls':
            case 'xlsx':
            case 'csv':
                return <FileSpreadsheet className="h-24 w-24 text-green-600 mb-4" />;
            case 'ppt':
            case 'pptx':
                return <FileIcon className="h-24 w-24 text-orange-600 mb-4" />; // Could use a better icon if available
            default:
                return <FileText className="h-24 w-24 text-gray-400 mb-4" />;
        }
    };

    const getLabel = () => {
        switch (extension.toLowerCase()) {
            case 'doc':
            case 'docx':
                return 'Tài liệu Word';
            case 'xls':
            case 'xlsx':
            case 'csv':
                return 'Tài liệu Excel';
            case 'ppt':
            case 'pptx':
                return 'Tài liệu PowerPoint';
            default:
                return 'Tài liệu';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 min-h-[400px]">
            {getIcon()}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{getLabel()}</h3>
            <p className="text-gray-500 mb-8 text-center max-w-md">
                Hiện tại hệ thống chưa hỗ trợ xem trước trực tuyến cho định dạng .{extension}.
                {canViewFull ? ' Bạn có thể tải xuống để xem.' : ' Vui lòng mua hoặc tải xuống để xem nội dung.'}
            </p>

            {canViewFull ? (
                <Button className="w-48 bg-green-600 hover:bg-green-700" size="lg" onClick={() => window.open(fileUrl, '_blank')}>
                    <Download className="mr-2 h-5 w-5" /> Tải xuống ngay
                </Button>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                    <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">{isFree ? 'Nhận tài liệu để tải xuống' : 'Mua tài liệu để tải xuống'}</p>
                    <Button onClick={buyNow} size="default" className="w-full font-semibold">
                        {isFree ? 'Nhận miễn phí' : `Mua ngay (${price.toLocaleString()} đ)`}
                    </Button>
                </div>
            )}
        </div>
    );
}
