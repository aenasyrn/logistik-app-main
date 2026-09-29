<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicRegistrationRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_cannot_assign_an_admin_role(): void
    {
        $response = $this
            ->withSession(['login_captcha' => 'abcde'])
            ->post(route('register'), [
                'name' => 'New User',
                'email' => 'new-user@example.com',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'captcha' => 'abcde',
                'role' => 'admin',
            ]);

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'new-user@example.com',
            'role' => 'guest',
        ]);
    }
}