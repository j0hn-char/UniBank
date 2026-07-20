import {NavLink, useLocation, useNavigate} from 'react-router-dom'
import {
    Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
    SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar, SidebarTrigger
} from '@/components/ui/sidebar'
import {useAuth} from "@/context/AuthContext.tsx";
import {ThemeToggle} from "@/components/ThemeToggle.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeftRight, Landmark, LayoutDashboard, LogOut, ShieldCheck, Wallet} from "lucide-react";

export default function AppSidebar() {
    const location = useLocation()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const { setOpenMobile } = useSidebar()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    function handleNavClick() {            // add here
        setOpenMobile(false)
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-0">
                    <div className="size-5 rounded-md bg-primary shrink-0"></div>
                    <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">UniBank</span>
                    <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'}>
                            <NavLink to="/dashboard" onClick={handleNavClick}>
                                <LayoutDashboard />
                                <span>Dashboard</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/accounts'}>
                            <NavLink to="/accounts" onClick={handleNavClick}>
                                <Wallet />
                                <span>Accounts</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/transactions'}>
                            <NavLink to="/transactions" onClick={handleNavClick}>
                                <ArrowLeftRight />
                                <span>Transactions</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/loans'}>
                            <NavLink to="/loans" onClick={handleNavClick}>
                                <Landmark />
                                <span>Loans</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {user?.role === 'ADMIN' && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={location.pathname === '/admin/loans'}>
                                <NavLink to="/admin/loans" onClick={handleNavClick}>
                                    <ShieldCheck />
                                    <span>Admin</span>
                                </NavLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center justify-center py-2 border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
                    <ThemeToggle />
                </div>
                <div className="flex items-center gap-2 px-2 pb-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-0">
                    <div className="flex items-center justify-center size-7 rounded-full bg-accent text-accent-foreground text-xs font-semibold shrink-0">
                        {user?.email?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex-1 group-data-[collapsible=icon]:hidden">{user?.email}</p>
                    <Button variant="ghost" size="icon" className="size-7" onClick={handleLogout}>
                        <LogOut />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}