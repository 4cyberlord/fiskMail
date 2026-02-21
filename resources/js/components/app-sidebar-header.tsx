import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import student from '@/routes/student';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const auth = page.props.auth as { isAdmin?: boolean } | undefined;
    const pathname = new URL(page.url, 'http://localhost').pathname;
    const unreadCount = (page.props.unread_notifications_count as number) ?? 0;
    const showNotificationBell = pathname.startsWith('/student') || auth?.isAdmin === false;

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {showNotificationBell && (
                <Link
                    href={student.notifications.index.url()}
                    className="relative flex size-9 items-center justify-center rounded-md hover:bg-muted"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Link>
            )}
        </header>
    );
}
