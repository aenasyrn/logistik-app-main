<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ConvertJsonResponsesToInertia
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (
            !$request->header('X-Inertia')
            || !$response instanceof JsonResponse
            || $response->headers->has('X-Inertia')
        ) {
            return $response;
        }

        return redirect()->back(303)->with('inertiaResult', [
            'data' => $response->getData(true),
            'status' => $response->getStatusCode(),
        ]);
    }
}