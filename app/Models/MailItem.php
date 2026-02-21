<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $item_type
 * @property string $carrier
 * @property string|null $tracking_number
 * @property bool $is_sensitive
 * @property string|null $notes
 * @property \Carbon\CarbonInterface $deadline
 * @property \Carbon\CarbonInterface|null $notified_at
 * @property \Carbon\CarbonInterface|null $picked_up_at
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 */
class MailItem extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'item_type',
        'carrier',
        'tracking_number',
        'is_sensitive',
        'notes',
        'deadline',
        'notified_at',
        'picked_up_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'deadline' => 'date',
            'is_sensitive' => 'boolean',
            'notified_at' => 'datetime',
            'picked_up_at' => 'datetime',
        ];
    }

    public function scopeReadyForPickup($query)
    {
        return $query->whereNull('picked_up_at')->whereDate('deadline', '>=', now()->startOfDay());
    }

    public function scopeExpiringSoon($query)
    {
        return $query->whereNull('picked_up_at')
            ->whereDate('deadline', '>=', now()->startOfDay())
            ->whereDate('deadline', '<=', now()->addDays(2));
    }

    public function scopeOverdue($query)
    {
        return $query->whereNull('picked_up_at')->whereDate('deadline', '<', now()->startOfDay());
    }

    public function scopePickedUp($query)
    {
        return $query->whereNotNull('picked_up_at');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
    }
}
