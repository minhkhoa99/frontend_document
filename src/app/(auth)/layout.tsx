import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">EduMarket</h1>
                <p className="text-sm text-muted-foreground">Sàn thương mại điện tử tài liệu giảng dạy</p>
            </div>
            <div className="w-full max-w-[400px]">
                {children}
            </div>
            <div className="mt-8 text-center text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} EduMarket. All rights reserved.
            </div>
        </div>
    )
}
