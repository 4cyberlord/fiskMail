<p>Hello {{ $mailItem->user->name }},</p>

<p>You have a {{ ucfirst($mailItem->item_type) }} ready for pickup (carrier: {{ strtoupper($mailItem->carrier) }}).</p>

@if($mailItem->tracking_number)
<p>Tracking number: <strong>{{ $mailItem->tracking_number }}</strong></p>
@endif

<p>Please pick it up by <strong>{{ $mailItem->deadline->format('F j, Y') }}</strong>.</p>

<p>If you have questions, contact the mail room.</p>
