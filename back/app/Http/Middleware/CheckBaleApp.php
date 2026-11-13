<?php
namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBaleApp{
public function handle(Request $request, Closure $next)
{
    $userAgent = $request->header('User-Agent');

    if ($userAgent && (str_contains($userAgent, 'Ble') || str_contains($userAgent, 'Telegram'))) {
        return $next($request);
    }

    // اگر معتبر نبود، ارور ۴۰۳ یا ریدایرکت به صفحه خطا
    return response()->json(['error' => 'Access denied'], 403);
}
}