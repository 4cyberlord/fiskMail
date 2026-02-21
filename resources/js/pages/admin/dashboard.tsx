import { Head, Link } from '@inertiajs/react';
import {
    Package,
    CheckCircle,
    Clock,
    AlertCircle,
    Inbox,
    Search,
    Mail,
    BarChart3,
    Archive,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import type { BreadcrumbItem } from '@/types/navigation';

type Kpis = {
    received_today: number;
    picked_up_today: number;
    expiring_in_48h: number;
    overdue_items: number;
};
type QueueItem = {
    id: number;
    user: { name: string; student_id: string | null };
    deadline: string;
    days_left?: number;
    days_overdue?: number;
};
type ActivityItem = {
    type: string;
    label: string;
    user_name: string;
    created_at: string;
    mail_item_id: number;
};
type NotificationHealth = { emails_sent_today: number; emails_failed_today: number | null };
type PickupVolume = { count_today: number };

type Props = {
    kpis: Kpis;
    expiring_soon_queue: QueueItem[];
    overdue_queue: QueueItem[];
    recent_activity: ActivityItem[];
    notification_health: NotificationHealth;
    storage_capacity: number;
    pickup_volume: PickupVolume;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: admin.dashboard.url() },
];

function formatActivityDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function AdminDashboard({
    kpis,
    expiring_soon_queue,
    overdue_queue,
    recent_activity,
    notification_health,
    storage_capacity,
    pickup_volume,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* KPI cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-sidebar-border/70 bg-card px-4 py-3 dark:border-sidebar-border">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Received Today</span>
                            <Inbox className="size-4 shrink-0 text-muted-foreground" />
                        </div>
                        <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{kpis.received_today}</p>
                    </div>
                    <div className="rounded-lg border border-sidebar-border/70 bg-card px-4 py-3 dark:border-sidebar-border">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Picked Up Today</span>
                            <CheckCircle className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{kpis.picked_up_today}</p>
                    </div>
                    <div className="rounded-lg border border-sidebar-border/70 bg-card px-4 py-3 dark:border-sidebar-border">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Expiring in 48h</span>
                            <Clock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{kpis.expiring_in_48h}</p>
                    </div>
                    <div className="rounded-lg border border-sidebar-border/70 bg-card px-4 py-3 dark:border-sidebar-border">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Overdue Items</span>
                            <AlertCircle className="size-4 shrink-0 text-destructive" />
                        </div>
                        <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{kpis.overdue_items}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={admin.receiveMail.url()}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Package className="size-4" /> + Receive Mail
                    </Link>
                    <Link
                        href={admin.pickupDesk.url()}
                        className="inline-flex items-center gap-2 rounded-md border border-sidebar-border/70 px-4 py-2 text-sm hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        Pickup Desk
                    </Link>
                    <Link
                        href={admin.students.url()}
                        className="inline-flex items-center gap-2 rounded-md border border-sidebar-border/70 px-4 py-2 text-sm hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <Search className="size-4" /> Search student / item
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Expiring Soon Queue */}
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <h2 className="text-sm font-semibold text-foreground">Expiring Soon Queue</h2>
                        {expiring_soon_queue.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">None.</p>
                        ) : (
                            <div className="mt-2 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70 text-left">
                                            <th className="py-2 font-medium">Student</th>
                                            <th className="py-2 font-medium">Deadline</th>
                                            <th className="py-2 font-medium">Days left</th>
                                            <th className="py-2 font-medium"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expiring_soon_queue.map((row) => (
                                            <tr key={row.id} className="border-b border-sidebar-border/70">
                                                <td className="py-2">
                                                    {row.user.name}
                                                    {row.user.student_id && (
                                                        <span className="ml-1 text-muted-foreground">
                                                            ({row.user.student_id})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2">{row.deadline}</td>
                                                <td className="py-2">{row.days_left ?? 0}</td>
                                                <td className="py-2">
                                                    <Link
                                                        href={admin.mailItems.sendReminder.url(row.id)}
                                                        method="post"
                                                        as="button"
                                                        className="text-primary hover:underline"
                                                    >
                                                        Send Reminder
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Overdue Queue */}
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <h2 className="text-sm font-semibold text-foreground">Overdue Queue</h2>
                        {overdue_queue.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">None.</p>
                        ) : (
                            <div className="mt-2 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70 text-left">
                                            <th className="py-2 font-medium">Student</th>
                                            <th className="py-2 font-medium">Deadline</th>
                                            <th className="py-2 font-medium">Days overdue</th>
                                            <th className="py-2 font-medium"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overdue_queue.map((row) => (
                                            <tr key={row.id} className="border-b border-sidebar-border/70">
                                                <td className="py-2">
                                                    {row.user.name}
                                                    {row.user.student_id && (
                                                        <span className="ml-1 text-muted-foreground">
                                                            ({row.user.student_id})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2">{row.deadline}</td>
                                                <td className="py-2">{row.days_overdue ?? 0}</td>
                                                <td className="py-2">
                                                    <Link
                                                        href={admin.mailItems.sendReminder.url(row.id)}
                                                        method="post"
                                                        as="button"
                                                        className="text-primary hover:underline"
                                                    >
                                                        Notify
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Activity */}
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
                        {recent_activity.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">No recent activity.</p>
                        ) : (
                            <ul className="mt-2 space-y-1.5 text-sm">
                                {recent_activity.map((a, i) => (
                                    <li key={`${a.mail_item_id}-${a.type}-${i}`} className="flex justify-between">
                                        <span>
                                            {a.label} — {a.user_name}
                                        </span>
                                        <span className="text-muted-foreground">{formatActivityDate(a.created_at)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Notification Health + Storage + Pickup Volume */}
                    <div className="space-y-3">
                        <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Mail className="size-4 text-muted-foreground" /> Notification Health
                            </h2>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                                Email sent today: <span className="font-medium tabular-nums text-foreground">{notification_health.emails_sent_today}</span>
                            </p>
                            {notification_health.emails_failed_today != null && (
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Failed: <span className="font-medium tabular-nums text-foreground">{notification_health.emails_failed_today}</span>
                                </p>
                            )}
                        </div>
                        <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <BarChart3 className="size-4 text-muted-foreground" /> Pickup Volume
                            </h2>
                            <p className="mt-1.5 text-base font-medium tabular-nums text-foreground">
                                {pickup_volume.count_today} <span className="font-normal text-muted-foreground">pickups today</span>
                            </p>
                        </div>
                        <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Archive className="size-4 text-muted-foreground" /> Storage
                            </h2>
                            <p className="mt-1.5 text-base font-medium tabular-nums text-foreground">
                                {storage_capacity} <span className="font-normal text-muted-foreground">items in storage</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
