<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request based on user roles.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login');
        }

        $userRole = $user->role ?? 'guest';

        // Treat legacy 'user' role as 'logistic_officer' for backwards compatibility
        $normalizedRole = ($userRole === 'user') ? 'logistic_officer' : $userRole;

        // Check if normalized user role matches any required role
        $allowed = in_array($normalizedRole, $roles) || in_array($userRole, $roles);

        if (!$allowed) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Akses ditolak. Peran (' . $userRole . ') Anda tidak memiliki izin untuk operasi ini.'
                ], 403);
            }

            abort(403, 'Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.');
        }

        return $next($request);
    }
}
