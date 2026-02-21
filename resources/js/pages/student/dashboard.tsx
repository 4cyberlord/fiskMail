import { Head, Link } from '@inertiajs/react';
import { Package, AlertCircle, CheckCircle, Clock, MapPin, User, Mail } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import type { BreadcrumbItem } from '@/types/navigation';

type DashboardUser = { name: string; student_id: string | null };
type Counts = {
    ready_for_pickup: number;
    expiring_soon: number;
    overdue: number;
    picked_up_this_month: number;
};
type NextPickup = { id: number; item_type: string; deadline: string; days_left: number } | null;
type RecentNotification = {
    id: number;
    title: string;
    message_preview: string;
    type: string;
    is_sensitive: boolean;
    created_at: string;
    mail_item_id: number | null;
};
type ReadyItem = { id: number; item_type: string; deadline: string; created_at: string };
type Mailroom = { location: string; hours: string };

type Props = {
    user: DashboardUser;
    counts: Counts;
    next_pickup: NextPickup;
    recent_notifications: RecentNotification[];
    ready_items_preview: ReadyItem[];
    mailroom: Mailroom;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: student.dashboard.url() },
];

function formatRelative(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d.getTime() === today.getTime()) {
        return `Today ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (d.getTime() === yesterday.getTime()) {
        return `Yesterday ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StudentDashboard({
    user,
    counts,
    next_pickup,
    recent_notifications,
    ready_items_preview,
    mailroom,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Welcome / Profile chip */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sidebar-border/70 bg-card px-4 py-3 dark:border-sidebar-border">
                    <User className="size-5 text-muted-foreground" />
                    <span className="font-medium">Hi, {user.name}</span>
                    {user.student_id && (
                        <span className="text-sm text-muted-foreground">ID: {user.student_id}</span>
                    )}
                </div>

                {/* Status summary cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href={student.notifications.index.url()}
                        className="rounded-xl border border-sidebar-border/70 bg-card p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <div className="flex items-center gap-2">
                            <Package className="size-5 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Ready for Pickup</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold">{counts.ready_for_pickup}</p>
                    </Link>
                    <Link
                        href={student.notifications.index.url()}
                        className="rounded-xl border border-sidebar-border/70 bg-card p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="size-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-muted-foreground">Expiring Soon</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold">{counts.expiring_soon}</p>
                    </Link>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="size-5 text-destructive" />
                            <span className="text-sm font-medium text-muted-foreground">Overdue</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold">{counts.overdue}</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-muted-foreground">Picked Up This Month</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold">{counts.picked_up_this_month}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Next Pickup widget */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <h2 className="font-semibold">Next Pickup</h2>
                        {next_pickup ? (
                            <div className="mt-3">
                                <p className="text-sm text-muted-foreground">
                                    Next deadline: {formatDate(next_pickup.deadline)} ({next_pickup.days_left} day
                                    {next_pickup.days_left !== 1 ? 's' : ''} left)
                                </p>
                                <Link
                                    href={student.mailItems.show.url(next_pickup.id)}
                                    className="mt-2 inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    View Item
                                </Link>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">No items waiting.</p>
                        )}
                    </div>

                    {/* Mailroom Info */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <MapPin className="size-4" /> Mailroom
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">{mailroom.location}</p>
                        <p className="text-sm text-muted-foreground">{mailroom.hours}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Bring your Student ID when you pick up.</p>
                    </div>
                </div>

                {/* Recent Notifications + Ready Items */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Recent Notifications</h2>
                            <Link
                                href={student.notifications.index.url()}
                                className="text-sm text-primary hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        {recent_notifications.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">No recent notifications.</p>
                        ) : (
                            <ul className="mt-2 space-y-2">
                                {recent_notifications.map((n) => (
                                    <li key={n.id}>
                                        <Link
                                            href={student.notifications.show.url(n.id)}
                                            className="block rounded-md py-1.5 text-sm hover:bg-muted/50"
                                        >
                                            <span className="font-medium">{n.title}</span>
                                            <span className="ml-1 text-muted-foreground">· {n.message_preview}</span>
                                            <span className="ml-1 text-xs text-muted-foreground">
                                                {formatRelative(n.created_at)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <h2 className="font-semibold">Ready Items Preview</h2>
                        {ready_items_preview.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">No items ready.</p>
                        ) : (
                            <ul className="mt-2 space-y-2">
                                {ready_items_preview.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={student.mailItems.show.url(item.id)}
                                            className="block rounded-md py-1.5 text-sm hover:bg-muted/50"
                                        >
                                            <span className="capitalize">{item.item_type}</span>
                                            <span className="ml-1 text-muted-foreground">
                                                received {formatRelative(item.created_at)} · due {formatDate(item.deadline)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <h2 className="font-semibold">Quick Actions</h2>
                    <div className="mt-3 flex flex-wrap gap-3">
                        <Link
                            href={student.notifications.index.url()}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Mail className="size-4" /> View My Items
                        </Link>
                        <span className="inline-flex items-center gap-2 rounded-md border border-sidebar-border/70 px-4 py-2 text-sm text-muted-foreground dark:border-sidebar-border">
                            Assign Delegate (coming soon)
                        </span>
                        <a
                            href="mailto:mailroom@campus.edu"
                            className="inline-flex items-center gap-2 rounded-md border border-sidebar-border/70 px-4 py-2 text-sm hover:bg-muted/50 dark:border-sidebar-border"
                        >
                            Report an Issue
                        </a>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
