import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import type { BreadcrumbItem } from '@/types/navigation';

export type MailItemDetail = {
    id: number;
    item_type: string;
    deadline: string;
    is_sensitive: boolean;
    carrier?: string;
    tracking_number?: string | null;
    notes?: string | null;
};

type Props = {
    mail_item: MailItemDetail;
    days_left: number;
    mailroom: { location: string; hours: string };
};

export default function StudentMailItemShow({ mail_item, days_left, mailroom }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Student Dashboard', href: student.dashboard.url() },
        { title: 'Notifications', href: student.notifications.index.url() },
        { title: 'Mail Item', href: student.mailItems.show.url(mail_item.id) },
    ];

    const typeLabel =
        mail_item.item_type === 'package'
            ? 'Package'
            : mail_item.item_type === 'letter'
              ? 'Letter'
              : 'Document';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${typeLabel} - Mail Item`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {typeLabel} Ready for Pickup
                    </h1>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <dl className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                            <dd className="mt-0.5">{typeLabel}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Pick up by</dt>
                            <dd className="mt-0.5">
                                {new Date(mail_item.deadline).toLocaleDateString()}
                            </dd>
                        </div>
                        {days_left > 0 && (
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Days left</dt>
                                <dd className="mt-0.5">{days_left}</dd>
                            </div>
                        )}
                        {!mail_item.is_sensitive && (
                            <>
                                {mail_item.carrier != null && (
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Carrier</dt>
                                        <dd className="mt-0.5">{mail_item.carrier}</dd>
                                    </div>
                                )}
                                {mail_item.tracking_number != null && (
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Tracking</dt>
                                        <dd className="mt-0.5 font-mono text-sm">{mail_item.tracking_number}</dd>
                                    </div>
                                )}
                                {mail_item.notes != null && mail_item.notes !== '' && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                                        <dd className="mt-0.5 whitespace-pre-wrap text-sm">{mail_item.notes}</dd>
                                    </div>
                                )}
                            </>
                        )}
                    </dl>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-muted/30 p-4 dark:border-sidebar-border">
                    <h2 className="font-medium">Mailroom</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{mailroom.location}</p>
                    <p className="text-sm text-muted-foreground">{mailroom.hours}</p>
                </div>

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
