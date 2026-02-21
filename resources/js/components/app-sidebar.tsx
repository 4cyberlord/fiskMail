import { Link, usePage } from '@inertiajs/react';
import { Bell, ClipboardList, LayoutGrid, Package, Users } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import student from '@/routes/student';
import type { NavItem } from '@/types';
import type { Auth } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage();
    const auth = (page.props.auth ?? {}) as Auth;
    const pathname = new URL(page.url, 'http://localhost').pathname;
    const isAdminArea = pathname.startsWith('/admin');
    const showAdminNav = auth.isAdmin === true || isAdminArea;

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        ...(showAdminNav
            ? [
                  { title: 'Students', href: admin.students.url(), icon: Users },
                  { title: 'Receive Mail', href: admin.receiveMail.url(), icon: Package },
                  { title: 'Pickup Desk', href: admin.pickupDesk.url(), icon: ClipboardList },
              ]
            : [{ title: 'Notifications', href: student.notifications.index.url(), icon: Bell }]),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
