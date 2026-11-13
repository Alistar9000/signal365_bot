<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use App\Services\BaleAuthService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
     
     public function __construct()
    {
       
    }
    
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->input('user');
        
        if(!$user->isAdmin()){
          return response()->json(['error' => 'دسترسی غیرمجاز']);
        }
        
        return $next($request);
    }
}
