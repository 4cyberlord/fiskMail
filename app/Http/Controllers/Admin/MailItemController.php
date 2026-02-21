<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MailItem;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class MailItemController extends Controller
{
    public function pickupDesk(Request $request): Response
    {
        $items = MailItem::query()
            ->whereNull('picked_up_at')
            ->with('user')
            ->orderBy('deadline')
            ->get()
            ->map(function (MailItem $item) {
                $daysLeft = (int) now()->startOfDay()->diffInDays($item->deadline->startOfDay(), false);
                if ($daysLeft < 0) {
                    $daysLeft = 0;
                }

                return [
                    'id' => $item->id,
                    'user' => ['name' => $item->user->name, 'student_id' => $item->user->student_id],
                    'item_type' => $item->item_type,
                    'deadline' => $item->deadline->toDateString(),
                    'days_left' => $daysLeft,
                ];
            });

        return Inertia::render('admin/pickup-desk/index', [
            'items' => $items,
        ]);
    }

    public function markPickedUp(Request $request, int $id): RedirectResponse
    {
        $item = MailItem::query()->findOrFail($id);
        $item->update(['picked_up_at' => now()]);

        return redirect()->back()->with('success', 'Item marked as picked up.');
    }

    public function sendReminder(Request $request, int $id): RedirectResponse
    {
        $item = MailItem::query()->with('user')->findOrFail($id);
        if ($item->picked_up_at !== null) {
            return redirect()->back()->with('error', 'Item already picked up.');
        }

        $deadlineFormatted = $item->deadline->format('F j, Y');
        $message = "Reminder: You have an item ready for pickup. Please pick up by {$deadlineFormatted}.";

        UserNotification::query()->create([
            'user_id' => $item->user_id,
            'mail_item_id' => $item->id,
            'title' => 'Reminder: Pickup deadline soon',
            'message' => $message,
            'type' => 'reminder',
            'is_sensitive' => $item->is_sensitive,
            'is_read' => false,
        ]);

        Mail::to($item->user->email)->send(new \App\Mail\MailItemReceived($item));

        return redirect()->back()->with('success', 'Reminder sent.');
    }
}
