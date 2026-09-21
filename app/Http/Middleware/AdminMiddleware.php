<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Akses ditolak. Hanya Admin yang dapat memodifikasi data master.'
                ], 403);
            }

            abort(403, 'Akses ditolak. Hanya Admin yang dapat memodifikasi data master.');
        }

        return $next($request);
    }
}
