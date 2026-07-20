import type { ReactNode } from 'react'

export default function PageContainer({ children }: { children: ReactNode }) {
    return (
        <div className="max-w-5xl mx-auto px-6 py-8 w-full">
            {children}
        </div>
    )
}