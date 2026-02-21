import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import type { BreadcrumbItem } from '@/types/navigation';

export type NotificationDetail = {
    id: number;
    title: string;
    message: string;
    type: string;
    is_sensitive: boolean;
    is_read: boolean;
    created_at: string;
    mail_item_id: number | null;
    deadline: string | null;
    days_left: number | null;
};

export type MailItemPayload = {
    id: number;
    item_type: string;
    deadline: string;
    is_sensitive: boolean;
    carrier?: string;
    tracking_number?: string | null;
    notes?: string | null;
} | null;

type Props = {
    notification: NotificationDetail;
    mail_item: MailItemPayload;
    mailroom: { location: string; hours: string };
};

export default function StudentNotificationShow({ notification, mail_item, mailroom }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Student Dashboard', href: student.dashboard.url() },
        { title: 'Notifications', href: student.notifications.index.url() },
        { title: notification.title, href: student.notifications.show.url(notification.id) },
    ];

    const status =
        notification.days_left === null
            ? 'Ready'
            : notification.days_left <= 3
              ? 'Expiring Soon'
              : 'Ready';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={notification.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{notification.title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <p className="whitespace-pre-wrap text-sm">{notification.message}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                            status === 'Expiring Soon'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                                : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {status}
                    </span>
                    {notification.deadline && (
                        <>
                            <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                                Pick up by {new Date(notification.deadline).toLocaleDateString()}
                            </span>
                            {notification.days_left !== null && notification.days_left > 0 && (
                                <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                                    {notification.days_left} day{notification.days_left !== 1 ? 's' : ''} left
                                </span>
                            )}
                        </>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-muted/30 p-4 dark:border-sidebar-border">
                    <h2 className="font-medium">Mailroom</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{mailroom.location}</p>
                    <p className="text-sm text-muted-foreground">{mailroom.hours}</p>
                </div>

                {mail_item && notification.mail_item_id && (
                    <div>
                        <Link
                            href={student.mailItems.show.url(notification.mail_item_id)}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            View Item
                        </Link>
                    </div>
                )}

                <Link
                    href={student.notifications.index.url()}
                    className="text-sm text-muted-foreground underline hover:text-foreground"
                >
                    ← Back to Notifications
                </Link>
            </div>
        </AppLayout>
    );
}
