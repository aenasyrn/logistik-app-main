<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_another_users_role_with_a_laravel_redirect(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'guest']);

        $response = $this->actingAs($admin)
            ->from('/manajemen-akses')
            ->put("/users/{$target->id}/role", ['role' => 'logistic_officer']);

        $response->assertRedirect('/manajemen-akses');

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'role' => 'logistic_officer',
        ]);
    }
}