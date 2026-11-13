<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use App\Services\BaleAuthService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
     protected $baleService;
     public function __construct(BaleAuthService $baleService)
    {
        $this->baleService = $baleService;
    }
    
    public function handle(Request $request, Closure $next): Response
    {
        //  \Log::info('entering verify user');
        // $token = $request->header('Authorization');

        // if (!$token) {
        //     return response()->json(['error' => 'Unauthorized!'], 401);
        // }
        
        // $user = User::where('api_token', $token)->first();
        // // $user = User::where('chat_id', 1098057719)->first();
          $initData = $request->header('Authorization');
        //   \Log::info('initData: '.$initData);
        //   $initData = $request->input('initData');
        // $token = $request->input('token');
        //  return response()->json(['error' => $initData], 401);
        
        if (!$initData || $initData == "") {
            // \Log::info('access denied in verify user middleware');
        return response()->json(['error' => 'دسترسی غیرمجاز!'],401);
        }
       
    //   if($initData!=""){
           
       $user = $this->baleService->validateInitData($initData);
           
        if (!$user) {
            //   \Log::info('invalid user in verify user middleware');
            return response()->json(['error' => 'Invalid user'], 401);
        }
        
        $userr = User::where('chat_id',$user['id'])->first();
        
        if (!$userr) {
         
            //  \Log::info('invalid user2 not in user table in verify user middleware');
            return response()->json(['error' => 'Invalid user2'], 401);
        }
        
        
        $request->merge([
            'user' => $userr
            ]);
            
            
        return $next($request);
    }
}
