<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MiniAppController;
use App\Http\Controllers\TelegramController;

Route::prefix('/mini-app')->group(function () {
   
    Route::post('/auth', [MiniAppController::class, 'auth']);

    Route::post('/webhook', [TelegramController::class, 'handle']);

     Route::middleware(['verify.user'])->group(function () {
       
        Route::get('/guide', [MiniAppController::class, 'guide'])->name('guide');
        Route::get('/top100', [MiniAppController::class, 'top100'])->name('vip.top100');
        Route::post('/symbols', [MiniAppController::class, 'searchSymbols']);
        Route::post('/symbols/{symbol_code}', [MiniAppController::class, 'searchSymbolsCheck']);
        
        Route::prefix('alarms')->group(function(){
            
             Route::get('/',[MiniAppController::class, 'alarms']);
             Route::put('/delete', [MiniAppController::class, 'removeAlarms']);
             Route::put('/add', [MiniAppController::class, 'addAlarms']);
        }); 
        
        Route::get('/today-signals', [MiniAppController::class, 'todaySignals'])->name('vip.today_signals');
        Route::post('/stock-history', [MiniAppController::class, 'stockHistory'])->name('vip.stock_history');
        Route::get('/plans',[MiniAppController::class, 'getPlans']);
  
        Route::prefix('admin')->middleware(['verify.admin'])->group(function () {
             Route::get('/users',[MiniAppController::class, 'usersCount']);
             Route::post('/check-user',[MiniAppController::class, 'checkUser']);
            Route::post('/vips/add',[MiniAppController::class, 'addVips']);
            Route::post('/vips/delete',[MiniAppController::class, 'deleteVips']);
            Route::post('/vips/add',[MiniAppController::class, 'addVips']);
            Route::post('/vips/delete',[MiniAppController::class, 'deleteVips']);
            Route::post('/add',[MiniAppController::class, 'addAdmin']);
            Route::post('/delete',[MiniAppController::class, 'deleteAdmin']);
            Route::get('/get',[MiniAppController::class, 'getAdmin']);
            Route::get('/range',[MiniAppController::class, 'getRange']);
            Route::post('/range',[MiniAppController::class, 'setRange']);
     
            Route::post('/add-days/all',[MiniAppController::class, 'addDaysAll']);
            Route::post('/add-days/vip',[MiniAppController::class, 'addDaysVip']);
            Route::post('/plans',[MiniAppController::class, 'updatePlans']);
            Route::post('/send-message',[MiniAppController::class, 'sendMessage']);
            // Route::post('/send-vip',[MiniAppController::class, 'sendMessageToVip']);
         });
    });
});
