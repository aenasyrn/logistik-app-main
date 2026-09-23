<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    public function test_guest_cannot_create_inventory_data(): void
    {
        $response = $this->postJson('/printers', []);

        $response->assertUnauthorized();
    }

    public function test_logistic_officer_cannot_manage_users(): void
    {
        $user = User::factory()->make(['role' => 'logistic_officer']);

        $response = $this
            ->actingAs($user)
            ->postJson('/users', []);

        $response->assertForbidden();
    }

    public function test_logistic_officer_cannot_update_or_delete_inventory_data(): void
    {
        $user = User::factory()->make(['role' => 'logistic_officer']);

        $this->actingAs($user)
            ->putJson('/printers/1', [])
            ->assertForbidden();

        $this->actingAs($user)
            ->deleteJson('/printers/1')
            ->assertForbidden();
    }
}
