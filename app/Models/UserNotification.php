<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotification extends Model
{
    protected $table = 'user_notifications';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'mail_item_id',
        'title',
        'message',
        'type',
        'is_sensitive',
        'is_read',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_sensitive' => 'boolean',
            'is_read' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mailItem(): BelongsTo
    {
        return $this->belongsTo(MailItem::class);
    }
}
