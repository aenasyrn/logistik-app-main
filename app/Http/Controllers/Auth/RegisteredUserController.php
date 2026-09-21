<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use App\Services\CaptchaService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $captcha = CaptchaService::generate();

        return Inertia::render('Auth/Register', [
            'captchaSvg' => $captcha['svg'],
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'nullable|string|in:admin,logistic_officer,guest',
            'captcha' => ['required', 'string'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.unique' => 'Alamat email ini sudah terdaftar di sistem.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'captcha.required' => 'Kode keamanan captcha wajib diisi.',
        ]);

        if (! CaptchaService::validate($request->input('captcha'))) {
            CaptchaService::generate();

            throw ValidationException::withMessages([
                'captcha' => 'Kode keamanan captcha tidak cocok atau sudah kedaluwarsa.',
            ]);
        }

        $role = $request->input('role', 'logistic_officer');

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
        ]);

        ActivityLog::create([
            'user_email' => $user->email,
            'action' => 'Registrasi Akun',
            'module' => 'Autentikasi',
            'details' => "Pengguna baru {$user->name} ({$user->email}) mendaftar dengan peran {$user->role}",
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
