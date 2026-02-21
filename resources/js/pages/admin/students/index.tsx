import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard as adminDashboard, students as adminStudents } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';

export type Student = {
    id: number;
    name: string;
    email: string;
    student_id: string | null;
    phone: string | null;
    email_verified_at: string | null;
    created_at: string;
};

type Props = {
    students: Student[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminDashboard.url() },
    { title: 'Students', href: adminStudents.url() },
];

function formatRegistered(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function AdminStudentsIndex({ students }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {students.length === 0 ? (
                        <div className="px-6 py-12 text-center text-muted-foreground">
                            No registered students yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 bg-sidebar-accent/30 dark:border-sidebar-border">
                                        <th className="px-4 py-3 font-medium text-sidebar-foreground">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium text-sidebar-foreground">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 font-medium text-sidebar-foreground">
                                            Student ID
                                        </th>
                                        <th className="px-4 py-3 font-medium text-sidebar-foreground">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 font-medium text-sidebar-foreground">
                                            Verified
                                        </th>
                                        <th className="px-4 py-3 font-medium text-sidebar-foreground">
                                            Registered
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="border-b border-sidebar-border/50 transition-colors hover:bg-sidebar-accent/20 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3 text-sidebar-foreground">
                                                {student.name}
                                            </td>
                                            <td className="px-4 py-3 text-sidebar-foreground">
                                                {student.email}
                                            </td>
                                            <td className="px-4 py-3 text-sidebar-foreground">
                                                {student.student_id ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sidebar-foreground">
                                                {student.phone ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sidebar-foreground">
                                                {student.email_verified_at ? 'Yes' : 'No'}
                                            </td>
                                            <td className="px-4 py-3 text-sidebar-foreground">
                                                {formatRegistered(student.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
