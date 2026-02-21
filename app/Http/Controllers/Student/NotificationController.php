<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    private const MESSAGE_PREVIEW_LENGTH = 80;

    /**
     * List notifications for the current student with optional filter.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filter = $request->query('filter', 'all');

        $query = UserNotification::query()
            ->where('user_id', $user->id)
            ->with('mailItem')
            ->orderByDesc('created_at');

        match ($filter) {
            'unread' => $query->where('is_read', false),
            'packages' => $query->where('type', 'received')
                ->whereHas('mailItem', fn ($q) => $q->where('item_type', 'package')),
            'sensitive' => $query->where('is_sensitive', true),
            'reminders' => $query->where('type', 'reminder'),
            default => null,
        };

        $notifications = $query->get()->map(function (UserNotification $n) {
            $deadline = $n->mailItem?->deadline?->toDateString();

            return [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'message_preview' => str()->limit($n->message, self::MESSAGE_PREVIEW_LENGTH),
                'type' => $n->type,
                'item_type' => $n->mailItem?->item_type,
                'is_sensitive' => $n->is_sensitive,
                'is_read' => $n->is_read,
                'created_at' => $n->created_at->toIso8601String(),
                'mail_item_id' => $n->mail_item_id,
                'deadline' => $deadline,
            ];
        });

        return Inertia::render('student/notifications/index', [
            'notifications' => $notifications,
            'filter' => $filter,
        ]);
    }

    /**
     * Show a single notification and mark it read.
     */
    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        $notification = UserNotification::query()
            ->where('user_id', $user->id)
            ->with('mailItem')
            ->findOrFail($id);

        $notification->update(['is_read' => true]);

        $deadline = $notification->mailItem?->deadline;
        $today = now()->startOfDay();
        $daysLeft = $deadline ? (int) ceil(($deadline->startOfDay()->timestamp - $today->timestamp) / 86400) : null;

        $mailItemPayload = null;
        if ($notification->mailItem) {
            $item = $notification->mailItem;
            $mailItemPayload = [
                'id' => $item->id,
                'item_type' => $item->item_type,
                'deadline' => $item->deadline->toDateString(),
                'is_sensitive' => $item->is_sensitive,
            ];
            if (! $item->is_sensitive) {
                $mailItemPayload['carrier'] = $item->carrier;
                $mailItemPayload['tracking_number'] = $item->tracking_number;
                $mailItemPayload['notes'] = $item->notes;
            }
        }

        return Inertia::render('student/notifications/show', [
            'notification' => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'is_sensitive' => $notification->is_sensitive,
                'is_read' => true,
                'created_at' => $notification->created_at->toIso8601String(),
                'mail_item_id' => $notification->mail_item_id,
                'deadline' => $deadline?->toDateString(),
                'days_left' => $daysLeft,
            ],
            'mail_item' => $mailItemPayload,
            'mailroom' => [
                'location' => config('mailroom.location'),
                'hours' => config('mailroom.hours'),
            ],
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markRead(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $notification = UserNotification::query()
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $notification->update(['is_read' => true]);

        return redirect()->route('student.notifications.show', $id);
    }

    /**
     * Mark a notification as unread.
     */
    public function markUnread(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $notification = UserNotification::query()
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $notification->update(['is_read' => false]);

        return redirect()->back()->with('success', 'Notification marked as unread.');
    }

    /**
     * Mark all notifications as read for the current student.
     */
    public function markAllRead(Request $request): RedirectResponse
    {
        UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->update(['is_read' => true]);

        return redirect()
            ->route('student.notifications.index')
            ->with('success', 'All notifications marked as read.');
    }

    /**
     * Mark all notifications as unread for the current student.
     */
    public function markAllUnread(Request $request): RedirectResponse
    {
        UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->update(['is_read' => false]);

        return redirect()
            ->route('student.notifications.index')
            ->with('success', 'All notifications marked as unread.');
    }

    /**
     * Delete all notifications for the current student.
     */
    public function deleteAll(Request $request): RedirectResponse
    {
        UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->delete();

        return redirect()
            ->route('student.notifications.index')
            ->with('success', 'All notifications deleted.');
    }
}
