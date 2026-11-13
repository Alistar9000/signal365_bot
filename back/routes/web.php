<?php

use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\TelegramBotController;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\MiniAppController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TutorialController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

use Illuminate\Support\Str;
use App\Models\User;

Route::group(['prefix' => '/'],function(){
    
    // Route::get('/',function(){return view('welcome');})->name('index');
        
    Route::get('/', function(){
    //      $userAgent = request()->header('User-Agent');
    //      if (!$userAgent || stripos($userAgent, 'Bale') === false) {
             
    //          return response()->view('errors.access-denied', [], 403);
    // }
    // return "hello";
        return view('errors.access-denied');
    } );
    
    Route::get('/tutorials/{slug}/title={title?}', [TutorialController::class, 'show'])->name('tutorials.show');
    
    Route::get('/payment/start', [PaymentController::class, 'start'])->name('payment.start')->middleware('verify.payment.token');
    
    Route::get('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
});
    

