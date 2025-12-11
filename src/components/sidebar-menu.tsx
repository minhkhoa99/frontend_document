'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown, Book, Folder } from 'lucide-react';

interface Menu {
    id: string;
    label: string;
    link?: string;
    icon?: string;
    children: Menu[];
    isOpen?: boolean;
}

export function SidebarMenu() {
    const [menus, setMenus] = React.useState<Menu[]>([]);

    React.useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(`${apiUrl}/menus/tree`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch menus');
                return res.json();
            })
            .then((data) => {
                // Add isOpen state to each menu item for UI control
                const addState = (items: Menu[]): Menu[] => items.map(item => ({
                    ...item,
                    isOpen: false, // Default closed
                    children: addState(item.children || [])
                }));
                setMenus(addState(data));
            })
            .catch((err) => console.error(err));
    }, []);

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenus(prev => {
            const toggle = (items: Menu[]): Menu[] => {
                return items.map(item => {
                    if (item.id === id) {
                        return { ...item, isOpen: !item.isOpen };
                    }
                    return { ...item, children: toggle(item.children || []) };
                })
            }
            return toggle(prev);
        });
    };

    const renderIcon = (iconName?: string) => {
        if (iconName === 'book') return <Book className="h-4 w-4 mr-2" />;
        return <Folder className="h-4 w-4 mr-2 text-blue-500" />;
    };

    const renderTree = (items: Menu[], level = 0) => {
        return (
            <ul className={cn("space-y-1", level > 0 && "ml-4 border-l border-gray-200 pl-2")}>
                {items.map((item) => (
                    <li key={item.id}>
                        <div className="flex items-center justify-between group">
                            {item.children && item.children.length > 0 ? (
                                <button
                                    onClick={(e) => toggleMenu(item.id, e)}
                                    className="flex items-center w-full py-2 px-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <span className="flex items-center">
                                        {renderIcon(item.icon)}
                                        {item.label}
                                    </span>
                                    {item.isOpen ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            ) : (
                                <Link href={item.link || '#'} className="flex items-center w-full py-2 px-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                    {renderIcon(item.icon)}
                                    {item.label}
                                </Link>
                            )}
                        </div>
                        {item.children && item.children.length > 0 && item.isOpen && (
                            <div className="mt-1">
                                {renderTree(item.children, level + 1)}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="w-64 bg-white border-r h-[calc(100vh-4rem)] overflow-y-auto p-4 hidden lg:block sticky top-16">
            <h3 className="font-semibold text-lg mb-4 px-2 text-blue-800 uppercase tracking-wide">Thư mục</h3>
            {menus.length === 0 ? <p className="text-sm text-gray-500 px-2">Đang tải...</p> : renderTree(menus)}
        </div>
    );
}
