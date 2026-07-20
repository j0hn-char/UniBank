import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import {Toaster} from "@/components/ui/sonner.tsx";

export default function Layout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex items-center h-12 px-4 border-b border-border md:hidden">
                    <SidebarTrigger />
                </div>
                <Outlet />
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    )
}