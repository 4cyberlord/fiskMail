<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMailItemRequest;
use App\Mail\MailItemReceived;
use App\Models\MailItem;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ReceiveMailController extends Controller
{
    /**
     * Show the receive mail (log new item) form.
     */
    public function create(): Response
    {
        $today = now()->startOfDay();
        $startOfWeek = now()->startOfWeek();

        $stats = [
            'loggedToday' => MailItem::query()->whereDate('created_at', $today)->count(),
            'pendingPickup' => MailItem::query()->whereDate('deadline', '>=', $today)->count(),
            'notifiedThisWeek' => MailItem::query()
                ->whereNotNull('notified_at')
                ->where('notified_at', '>=', $startOfWeek)
                ->count(),
        ];

        $recentItems = MailItem::query()
            ->with('user')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn (MailItem $item) => [
                'id' => $item->id,
                'student_name' => $item->user->name,
                'item_type' => $item->item_type,
                'carrier' => $item->carrier,
                'deadline' => $item->deadline->toDateString(),
                'created_at' => $item->created_at->toIso8601String(),
                'is_sensitive' => $item->is_sensitive,
            ]);

        return Inertia::render('admin/receive-mail/index', [
            'itemTypes' => [
                ['value' => 'package', 'label' => 'Package'],
                ['value' => 'letter', 'label' => 'Letter'],
                ['value' => 'document', 'label' => 'Document'],
            ],
            'carriers' => [
                ['value' => 'amazon', 'label' => 'Amazon'],
                ['value' => 'usps', 'label' => 'USPS'],
                ['value' => 'ups', 'label' => 'UPS'],
                ['value' => 'fedex', 'label' => 'FedEx'],
                ['value' => 'other', 'label' => 'Other'],
            ],
            'stats' => $stats,
            'recentItems' => $recentItems,
        ]);
    }

    /**
     * Store a new mail item and optionally notify the student.
     */
    public function store(StoreMailItemRequest $request): RedirectResponse
    {
        $notify = $request->boolean('notify');

        $mailItem = MailItem::query()->create([
            'user_id' => $request->validated('user_id'),
            'item_type' => $request->validated('item_type'),
            'carrier' => $request->validated('carrier'),
            'tracking_number' => $request->validated('tracking_number'),
            'is_sensitive' => $request->boolean('is_sensitive'),
            'notes' => $request->validated('notes'),
            'deadline' => $request->validated('deadline'),
            'notified_at' => $notify ? now() : null,
        ]);

        if ($notify) {
            $mailItem->load('user');
            Mail::to($mailItem->user->email)->send(new MailItemReceived($mailItem));

            $title = $mailItem->is_sensitive
                ? 'Sensitive Item Ready'
                : ucfirst($mailItem->item_type).' Ready for Pickup';

            $deadlineFormatted = $mailItem->deadline->format('F j, Y');
            $message = $mailItem->is_sensitive
                ? "You have an item ready for pickup at the mailroom. Pick up by {$deadlineFormatted}."
                : sprintf(
                    'A %s has arrived for you (carrier: %s). Pick up by %s.',
                    $mailItem->item_type,
                    strtoupper($mailItem->carrier),
                    $deadlineFormatted
                );
            if (! $mailItem->is_sensitive && $mailItem->tracking_number) {
                $message .= ' Tracking: '.$mailItem->tracking_number.'.';
            }

            UserNotification::query()->create([
                'user_id' => $mailItem->user_id,
                'mail_item_id' => $mailItem->id,
                'title' => $title,
                'message' => $message,
                'type' => 'received',
                'is_sensitive' => $mailItem->is_sensitive,
                'is_read' => false,
            ]);
        }

        $message = $notify
            ? 'Mail item logged. Student has been notified by email and in-app notification.'
            : 'Mail item logged successfully.';

        return redirect()->route('admin.receive-mail')->with('success', $message);
    }
}
