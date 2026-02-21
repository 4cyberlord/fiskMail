import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    Clock,
    Package,
    ShieldAlert,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import {
    dashboard as adminDashboard,
    receiveMail,
} from '@/routes/admin';
import receiveMailRoutes from '@/routes/admin/receive-mail';
import { lookup as studentsLookup } from '@/routes/admin/students';
import type { BreadcrumbItem } from '@/types';

type ItemType = { value: string; label: string };
type Carrier = { value: string; label: string };

type RecentItem = {
    id: number;
    student_name: string;
    item_type: string;
    carrier: string;
    deadline: string;
    created_at: string;
    is_sensitive: boolean;
};

type Stats = {
    loggedToday: number;
    pendingPickup: number;
    notifiedThisWeek: number;
};

type Props = {
    itemTypes: ItemType[];
    carriers: Carrier[];
    stats: Stats;
    recentItems: RecentItem[];
};

function defaultDeadline(): string {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminDashboard.url() },
    { title: 'Receive Mail', href: receiveMail.url() },
];

function formatRelative(dateIso: string): string {
    const d = new Date(dateIso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function deadlineStatus(deadlineStr: string): 'overdue' | 'soon' | 'ok' {
    const d = new Date(deadlineStr);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'soon';
    return 'ok';
}

function formatDeadline(deadlineStr: string): string {
    return new Date(deadlineStr + 'T12:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function ReceiveMailIndex({
    itemTypes,
    carriers,
    stats,
    recentItems,
}: Props) {
    const { props } = usePage();
    const flash = props.flash as { success?: string } | undefined;
    const [studentIdInput, setStudentIdInput] = useState('');
    const [studentName, setStudentName] = useState<string | null>(null);
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);

    const form = useForm({
        user_id: null as number | null,
        item_type: 'package',
        carrier: 'amazon',
        tracking_number: '',
        is_sensitive: false,
        notes: '',
        deadline: defaultDeadline(),
        notify: false,
    });

    const doLookup = useCallback(async () => {
        const sid = studentIdInput.replace(/\D/g, '');
        if (sid.length !== 7) {
            setLookupError('Enter a 7-digit Student ID.');
            setStudentName(null);
            form.setData('user_id', null);
            return;
        }
        setLookupError(null);
        setLookupLoading(true);
        try {
            const url = studentsLookup.url({ query: { student_id: sid } });
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setStudentName(null);
                form.setData('user_id', null);
                setLookupError((data as { message?: string }).message ?? 'Student not found.');
                return;
            }
            setStudentName((data as { name: string }).name ?? null);
            form.setData('user_id', (data as { id: number }).id ?? null);
        } finally {
            setLookupLoading(false);
        }
    }, [studentIdInput, form]);

    const handleClear = useCallback(() => {
        setStudentIdInput('');
        setStudentName(null);
        setLookupError(null);
        form.reset();
        form.setData('deadline', defaultDeadline());
    }, [form]);

    const submitWithNotify = () => {
        form.transform((data) => ({ ...data, notify: true }));
        form.post(receiveMailRoutes.store.url());
    };

    const submitWithoutNotify = () => {
        form.transform((data) => ({ ...data, notify: false }));
        form.post(receiveMailRoutes.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Receive Mail" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30">
                        <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(320px,400px)]">
                    <div className="min-w-0 rounded-xl border border-sidebar-border/70 bg-sidebar/50 shadow-sm dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold text-sidebar-foreground">
                            Log new item
                        </h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Look up a student and enter the mail details. Save + Notify sends the
                            student an email.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 p-6">
                        <section className="flex flex-col gap-4">
                            <h3 className="text-sm font-medium text-sidebar-foreground">
                                Student
                            </h3>
                            <div className="grid gap-2">
                                <Label htmlFor="student_id">Student ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="student_id"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="7 digits (e.g. 1234567)"
                                        minLength={7}
                                        maxLength={7}
                                        value={studentIdInput}
                                        onChange={(e) =>
                                            setStudentIdInput(
                                                e.target.value.replace(/\D/g, '').slice(0, 7)
                                            )
                                        }
                                        onBlur={() =>
                                            studentIdInput.length === 7 && doLookup()
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={doLookup}
                                        disabled={
                                            lookupLoading || studentIdInput.length !== 7
                                        }
                                    >
                                        {lookupLoading ? (
                                            <Spinner className="size-4" />
                                        ) : (
                                            'Look up'
                                        )}
                                    </Button>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Enter the 7-digit Fisk Student ID, then look up to confirm.
                                </p>
                                {lookupError && (
                                    <p className="text-destructive text-sm">{lookupError}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label>Student name</Label>
                                <div
                                    className={
                                        studentName
                                            ? 'rounded-md border border-sidebar-border/70 bg-muted/30 px-3 py-2 text-sm font-medium text-sidebar-foreground dark:border-sidebar-border'
                                            : 'rounded-md border border-dashed border-sidebar-border/50 bg-muted/20 px-3 py-2 text-sm text-muted-foreground dark:border-sidebar-border'
                                    }
                                >
                                    {studentName ?? 'Look up a student to see name'}
                                </div>
                            </div>
                        </section>

                        <section className="flex flex-col gap-4 border-t border-sidebar-border/70 pt-6 dark:border-sidebar-border">
                            <h3 className="text-sm font-medium text-sidebar-foreground">
                                Item details
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="item_type">Item type</Label>
                                    <Select
                                        value={form.data.item_type}
                                        onValueChange={(v) => form.setData('item_type', v)}
                                    >
                                        <SelectTrigger id="item_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {itemTypes.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.item_type} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="carrier">Carrier</Label>
                                    <Select
                                        value={form.data.carrier}
                                        onValueChange={(v) => form.setData('carrier', v)}
                                    >
                                        <SelectTrigger id="carrier">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carriers.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.carrier} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tracking_number">Tracking # (optional)</Label>
                                <Input
                                    id="tracking_number"
                                    value={form.data.tracking_number}
                                    onChange={(e) =>
                                        form.setData('tracking_number', e.target.value)
                                    }
                                    placeholder="e.g. 1Z999AA10123456784"
                                />
                                <InputError message={form.errors.tracking_number} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_sensitive"
                                    checked={form.data.is_sensitive}
                                    onCheckedChange={(checked) =>
                                        form.setData('is_sensitive', checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="is_sensitive"
                                    className="cursor-pointer font-normal text-muted-foreground"
                                >
                                    Sensitive (e.g. confidential or ID required to release)
                                </Label>
                            </div>
                            <InputError message={form.errors.is_sensitive} />
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <textarea
                                    id="notes"
                                    className="border-input flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    placeholder="Any extra details for the mail room or student"
                                />
                                <InputError message={form.errors.notes} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="deadline">Pickup deadline</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={form.data.deadline}
                                    onChange={(e) =>
                                        form.setData('deadline', e.target.value)
                                    }
                                />
                                <p className="text-muted-foreground text-xs">
                                    Default is 5 days from today. Student should pick up by this
                                    date.
                                </p>
                                <InputError message={form.errors.deadline} />
                            </div>
                        </section>

                        <InputError message={form.errors.user_id} />

                        <div className="flex flex-wrap gap-3 border-t border-sidebar-border/70 pt-6 dark:border-sidebar-border">
                            <Button
                                type="button"
                                onClick={submitWithNotify}
                                disabled={form.processing || form.data.user_id == null}
                            >
                                {form.processing ? (
                                    <Spinner className="size-4" />
                                ) : null}
                                Save + Notify
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={submitWithoutNotify}
                                disabled={form.processing || form.data.user_id == null}
                            >
                                Save only
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClear}
                                disabled={form.processing}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                    </div>

                    <aside className="flex flex-col gap-6 lg:sticky lg:top-4 lg:self-start">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-sidebar/80 to-sidebar/40 p-4 shadow-sm dark:border-sidebar-border">
                                <Package className="mb-2 size-5 text-muted-foreground" />
                                <p className="text-2xl font-semibold tabular-nums text-sidebar-foreground">
                                    {stats.loggedToday}
                                </p>
                                <p className="text-muted-foreground text-xs font-medium">
                                    Logged today
                                </p>
                            </div>
                            <div className="rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-sidebar/80 to-sidebar/40 p-4 shadow-sm dark:border-sidebar-border">
                                <Clock className="mb-2 size-5 text-muted-foreground" />
                                <p className="text-2xl font-semibold tabular-nums text-sidebar-foreground">
                                    {stats.pendingPickup}
                                </p>
                                <p className="text-muted-foreground text-xs font-medium">
                                    Pending pickup
                                </p>
                            </div>
                            <div className="rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-sidebar/80 to-sidebar/40 p-4 shadow-sm dark:border-sidebar-border">
                                <Bell className="mb-2 size-5 text-muted-foreground" />
                                <p className="text-2xl font-semibold tabular-nums text-sidebar-foreground">
                                    {stats.notifiedThisWeek}
                                </p>
                                <p className="text-muted-foreground text-xs font-medium">
                                    Notified this week
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-sidebar-border/70 bg-sidebar/50 shadow-sm dark:border-sidebar-border">
                            <div className="border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border">
                                <h3 className="text-sm font-semibold text-sidebar-foreground">
                                    Recently logged
                                </h3>
                                <p className="text-muted-foreground text-xs">
                                    Latest items in the mail room
                                </p>
                            </div>
                            <div className="max-h-[420px] overflow-y-auto p-2">
                                {recentItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                        <Package className="size-10 text-muted-foreground/50" />
                                        <p className="text-muted-foreground text-sm">
                                            No items yet
                                        </p>
                                        <p className="text-muted-foreground/80 text-xs">
                                            Log your first item with the form
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-1.5">
                                        {recentItems.map((item) => {
                                            const status = deadlineStatus(item.deadline);
                                            return (
                                                <li
                                                    key={item.id}
                                                    className="flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-sidebar-accent/30"
                                                >
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-foreground">
                                                        {item.student_name
                                                            .split(/\s+/)
                                                            .map((s) => s[0])
                                                            .join('')
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-sidebar-foreground">
                                                            {item.student_name}
                                                        </p>
                                                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs font-medium capitalize">
                                                                {item.item_type}
                                                            </span>
                                                            <span className="text-muted-foreground text-xs">
                                                                {item.carrier.toUpperCase()}
                                                            </span>
                                                            {item.is_sensitive && (
                                                                <ShieldAlert className="size-3.5 text-amber-500" title="Sensitive" />
                                                            )}
                                                        </div>
                                                        <p
                                                            className={`mt-1 text-xs ${
                                                                status === 'overdue'
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : status === 'soon'
                                                                      ? 'text-amber-600 dark:text-amber-400'
                                                                      : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            By {formatDeadline(item.deadline)}
                                                            {status === 'overdue' && ' (overdue)'}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 text-muted-foreground text-xs">
                                                        {formatRelative(item.created_at)}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
