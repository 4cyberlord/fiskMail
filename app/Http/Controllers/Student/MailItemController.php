<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\MailItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MailItemController extends Controller
{
    /**
     * Show a mail item for the current student (ownership check). Sensitive items omit carrier, tracking, notes.
     */
    public function show(Request $request, int $id): Response
    {
        $mailItem = MailItem::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $payload = [
            'id' => $mailItem->id,
            'item_type' => $mailItem->item_type,
            'deadline' => $mailItem->deadline->toDateString(),
            'is_sensitive' => $mailItem->is_sensitive,
        ];

        if (! $mailItem->is_sensitive) {
            $payload['carrier'] = $mailItem->carrier;
            $payload['tracking_number'] = $mailItem->tracking_number;
            $payload['notes'] = $mailItem->notes;
        }

        $today = now()->startOfDay();
        $daysLeft = (int) ceil(($mailItem->deadline->startOfDay()->timestamp - $today->timestamp) / 86400);

        return Inertia::render('student/mail-items/show', [
            'mail_item' => $payload,
            'days_left' => $daysLeft,
            'mailroom' => [
                'location' => config('mailroom.location'),
                'hours' => config('mailroom.hours'),
            ],
        ]);
    }
}
