<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\MailItem;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $baseQuery = MailItem::query()->where('user_id', $user->id);

        $counts = [
            'ready_for_pickup' => (clone $baseQuery)->readyForPickup()->count(),
            'expiring_soon' => (clone $baseQuery)->expiringSoon()->count(),
            'overdue' => (clone $baseQuery)->overdue()->count(),
            'picked_up_this_month' => (clone $baseQuery)->pickedUp()
                ->whereMonth('picked_up_at', now()->month)
                ->whereYear('picked_up_at', now()->year)
                ->count(),
        ];

        $nextPickup = MailItem::query()
            ->where('user_id', $user->id)
            ->readyForPickup()
            ->orderBy('deadline')
            ->first();

        $nextPickupPayload = null;
        if ($nextPickup) {
            $today = now()->startOfDay();
            $daysLeft = (int) ceil(($nextPickup->deadline->startOfDay()->timestamp - $today->timestamp) / 86400);
            $nextPickupPayload = [
                'id' => $nextPickup->id,
                'item_type' => $nextPickup->item_type,
                'deadline' => $nextPickup->deadline->toDateString(),
                'days_left' => max(0, $daysLeft),
            ];
        }

        $recentNotifications = UserNotification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (UserNotification $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message_preview' => str()->limit($n->message, 60),
                'type' => $n->type,
                'is_sensitive' => $n->is_sensitive,
                'created_at' => $n->created_at->toIso8601String(),
                'mail_item_id' => $n->mail_item_id,
            ]);

        $readyItemsPreview = MailItem::query()
            ->where('user_id', $user->id)
            ->readyForPickup()
            ->orderBy('deadline')
            ->limit(3)
            ->get()
            ->map(fn (MailItem $item) => [
                'id' => $item->id,
                'item_type' => $item->item_type,
                'deadline' => $item->deadline->toDateString(),
                'created_at' => $item->created_at->toIso8601String(),
            ]);

        return Inertia::render('student/dashboard', [
            'user' => [
                'name' => $user->name,
                'student_id' => $user->student_id,
            ],
            'counts' => $counts,
            'next_pickup' => $nextPickupPayload,
            'recent_notifications' => $recentNotifications,
            'ready_items_preview' => $readyItemsPreview,
            'mailroom' => [
                'location' => config('mailroom.location'),
                'hours' => config('mailroom.hours'),
            ],
        ]);
    }
}
