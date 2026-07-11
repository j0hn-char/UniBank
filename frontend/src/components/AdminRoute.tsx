import type { ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"
import { Navigate } from "react-router-dom"

export default function AdminRoute({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (user === null) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}