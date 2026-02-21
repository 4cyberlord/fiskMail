<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MailItem;
use App\Models\UserNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        $kpis = [
            'received_today' => MailItem::query()->whereBetween('created_at', [$todayStart, $todayEnd])->count(),
            'picked_up_today' => MailItem::query()->whereNotNull('picked_up_at')
                ->whereBetween('picked_up_at', [$todayStart, $todayEnd])
                ->count(),
            'expiring_in_48h' => MailItem::query()->expiringSoon()->count(),
            'overdue_items' => MailItem::query()->overdue()->count(),
        ];

        $expiringSoonQueue = MailItem::query()
            ->expiringSoon()
            ->with('user')
            ->orderBy('deadline')
            ->limit(15)
            ->get()
            ->map(function (MailItem $item) {
                $daysLeft = (int) now()->startOfDay()->diffInDays($item->deadline->startOfDay(), false);
                if ($daysLeft < 0) {
                    $daysLeft = 0;
                }

                return [
                    'id' => $item->id,
                    'user' => ['name' => $item->user->name, 'student_id' => $item->user->student_id],
                    'deadline' => $item->deadline->toDateString(),
                    'days_left' => $daysLeft,
                ];
            });

        $overdueQueue = MailItem::query()
            ->overdue()
            ->with('user')
            ->orderBy('deadline')
            ->limit(15)
            ->get()
            ->map(function (MailItem $item) {
                $daysOverdue = (int) $item->deadline->startOfDay()->diffInDays(now()->startOfDay(), false);

                return [
                    'id' => $item->id,
                    'user' => ['name' => $item->user->name, 'student_id' => $item->user->student_id],
                    'deadline' => $item->deadline->toDateString(),
                    'days_overdue' => max(0, $daysOverdue),
                ];
            });

        $received = MailItem::query()
            ->with('user')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (MailItem $item) => [
                'type' => 'received',
                'label' => 'Item logged',
                'user_name' => $item->user->name,
                'created_at' => $item->created_at->toIso8601String(),
                'mail_item_id' => $item->id,
            ]);

        $pickedUp = MailItem::query()
            ->whereNotNull('picked_up_at')
            ->with('user')
            ->orderByDesc('picked_up_at')
            ->limit(10)
            ->get()
            ->map(fn (MailItem $item) => [
                'type' => 'picked_up',
                'label' => 'Picked up',
                'user_name' => $item->user->name,
                'created_at' => Carbon::parse($item->picked_up_at)->toIso8601String(),
                'mail_item_id' => $item->id,
            ]);

        $recentActivity = $received->concat($pickedUp)
            ->sortByDesc(fn ($e) => $e['created_at'])
            ->values()
            ->take(10)
            ->all();

        $emailsSentToday = UserNotification::query()
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->count();

        $notificationHealth = [
            'emails_sent_today' => $emailsSentToday,
            'emails_failed_today' => null,
        ];

        $storageCapacity = MailItem::query()->whereNull('picked_up_at')->count();

        $pickupVolume = [
            'count_today' => $kpis['picked_up_today'],
        ];

        return Inertia::render('admin/dashboard', [
            'kpis' => $kpis,
            'expiring_soon_queue' => $expiringSoonQueue,
            'overdue_queue' => $overdueQueue,
            'recent_activity' => $recentActivity,
            'notification_health' => $notificationHealth,
            'storage_capacity' => $storageCapacity,
            'pickup_volume' => $pickupVolume,
        ]);
    }
}
