import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import type { BreadcrumbItem } from '@/types/navigation';

type QueueItem = {
    id: number;
    user: { name: string; student_id: string | null };
    item_type: string;
    deadline: string;
    days_left: number;
};

type Props = {
    items: QueueItem[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: admin.dashboard.url() },
    { title: 'Pickup Desk', href: admin.pickupDesk.url() },
];

export default function AdminPickupDeskIndex({ items }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pickup Desk" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-semibold tracking-tight">Pickup Desk</h1>
                <p className="text-sm text-muted-foreground">
                    Mark items as picked up when students collect them.
                </p>
                {items.length === 0 ? (
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-8 text-center text-muted-foreground dark:border-sidebar-border">
                        No items waiting for pickup.
                    </div>
                ) : (
                    <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 bg-muted/30">
                                        <th className="px-4 py-3 font-medium">Student</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Deadline</th>
                                        <th className="px-4 py-3 font-medium">Days left</th>
                                        <th className="px-4 py-3 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b border-sidebar-border/70 last:border-b-0"
                                        >
                                            <td className="px-4 py-3">
                                                {row.user.name}
                                                {row.user.student_id && (
                                                    <span className="ml-1 text-muted-foreground">
                                                        ({row.user.student_id})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 capitalize">{row.item_type}</td>
                                            <td className="px-4 py-3">{row.deadline}</td>
                                            <td className="px-4 py-3">{row.days_left}</td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={admin.mailItems.markPickedUp.url(row.id)}
                                                    method="patch"
                                                    as="button"
                                                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                                >
                                                    Mark picked up
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
