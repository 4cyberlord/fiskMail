<?php

namespace Database\Factories;

use App\Models\MailItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MailItem>
 */
class MailItemFactory extends Factory
{
    protected $model = MailItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'item_type' => fake()->randomElement(['package', 'letter', 'document']),
            'carrier' => fake()->randomElement(['amazon', 'usps', 'ups', 'fedex', 'other']),
            'tracking_number' => fake()->optional(0.7)->regexify('[A-Z0-9]{12,22}'),
            'is_sensitive' => fake()->boolean(20),
            'notes' => fake()->optional(0.5)->sentence(),
            'deadline' => now()->addDays(5),
            'notified_at' => null,
        ];
    }
}
