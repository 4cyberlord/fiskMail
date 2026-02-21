import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCircle2, Lock, Mail, MailOpen, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import type { BreadcrumbItem } from '@/types/navigation';

export type NotificationListItem = {
    id: number;
    title: string;
    message: string;
    message_preview: string;
    type: string;
    item_type: string | null;
    is_sensitive: boolean;
    is_read: boolean;
    created_at: string;
    mail_item_id: number | null;
    deadline: string | null;
};

type FilterType = 'all' | 'unread' | 'packages' | 'sensitive' | 'reminders';

type Props = {
    notifications: NotificationListItem[];
    filter: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: student.dashboard.url() },
    { title: 'Notifications', href: student.notifications.index.url() },
];

const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'packages', label: 'Packages' },
    { value: 'sensitive', label: 'Sensitive' },
    { value: 'reminders', label: 'Reminders' },
];

function formatRelativeDate(iso: string): string {
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

function daysLeft(deadline: string | null): number | null {
    if (!deadline) return null;
    const end = new Date(deadline);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    return diff > 0 ? diff : null;
}

function typeTag(n: NotificationListItem): string {
    if (n.type === 'reminder') return 'Reminder';
    if (n.type === 'pickup') return 'Pickup Confirmed';
    if (n.item_type === 'package') return 'Package';
    if (n.item_type === 'letter') return 'Letter';
    if (n.item_type === 'document') return 'Document';
    return 'Received';
}

export default function StudentNotificationsIndex({ notifications, filter }: Props) {
    const currentFilter = filter as FilterType;
    const flash = (usePage().props.flash as { success?: string } | undefined) ?? {};

    function setFilter(value: FilterType) {
        const url = value === 'all'
            ? student.notifications.index.url()
            : `${student.notifications.index.url()}?filter=${value}`;
        router.get(url);
    }

    function handleMarkAllRead() {
        router.post(student.notifications.markAllRead.url(), {}, { preserveScroll: true });
    }

    function handleMarkAllUnread() {
        router.post(student.notifications.markAllUnread.url(), {}, { preserveScroll: true });
    }

    function handleDeleteAll() {
        if (window.confirm('Delete all notifications? This cannot be undone.')) {
            router.delete(student.notifications.deleteAll.url(), { preserveScroll: true });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30">
                        <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {notifications.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllRead}
                                    className="gap-1.5"
                                >
                                    <MailOpen className="size-4" />
                                    Mark all read
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllUnread}
                                    className="gap-1.5"
                                >
                                    <Mail className="size-4" />
                                    Mark all unread
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeleteAll}
                                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <Trash2 className="size-4" />
                                    Delete all
                                </Button>
                            </div>
                        )}
                        {FILTERS.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFilter(value)}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                    currentFilter === value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 py-16 text-center dark:border-sidebar-border">
                        <Bell className="mb-3 size-10 text-muted-foreground" />
                        <p className="text-muted-foreground">No notifications yet.</p>
                    </div>
                ) : (
                    <ul className="grid gap-3">
                        {notifications.map((n) => {
                            const dl = daysLeft(n.deadline);
                            return (
                                <li key={n.id} className="group relative">
                                    <Link
                                        href={student.notifications.show.url(n.id)}
                                        prefetch
                                        className="block rounded-xl border border-sidebar-border/70 bg-card p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                                    >
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-medium">{n.title}</span>
                                                    {!n.is_read && (
                                                        <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                    )}
                                                    {n.is_sensitive && (
                                                        <Lock className="size-4 shrink-0 text-muted-foreground" aria-label="Sensitive" />
                                                    )}
                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                                        {typeTag(n)}
                                                    </span>
                                                    {dl !== null && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {dl} day{dl !== 1 ? 's' : ''} left
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {n.message_preview}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                {n.is_read && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1 text-muted-foreground opacity-0 group-hover:opacity-100"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            router.post(student.notifications.markUnread.url(n.id), {}, { preserveScroll: true });
                                                        }}
                                                    >
                                                        <Mail className="size-3.5" />
                                                        Mark unread
                                                    </Button>
                                                )}
                                                <span className="text-sm text-muted-foreground">
                                                    {formatRelativeDate(n.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}
