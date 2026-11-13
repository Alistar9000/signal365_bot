<?php
namespace App\Console\Commands;

use App\Models\Symbol;
use App\Services\BourseApiService;
use App\Services\UpdateSymbols;
use App\Services\Telegram;
use Illuminate\Console\Command;
use Morilog\Jalali\Jalalian;
use Telegram\Bot\Api;

class UpdateSymbolsCommand extends Command
{
    protected $signature   = 'update:symbols';
    protected $description = 'دریافت و بروزرسانی اطلاعات قیمتی تمام سهام از API';

    public function handle(BourseApiService $bourseApi,UpdateSymbols $updateSymbols)
    {
         $telegram = new Telegram();
       
       $symbols = $updateSymbols->update();
        
//  histories

       if(!$symbols){
             return;
         }
        foreach ($symbols as $symbolData) {
            $symbol = Symbol::where('code', $symbolData['code'])->first();

            if (! $symbol) {
                continue;
            }

            $historyCount = $symbol->histories()->count();

                if ($historyCount >= 20) {
                    $oldest = $symbol->histories()->orderBy('created_at', 'asc')->first();
                    if ($oldest) {
                        $oldest->delete();
                    }
                } 
                
                if($symbolData['high'] == 0){
                    
                 $lastest =  $symbol->histories()->orderBy('created_at', 'desc')->first();
                 
                     $symbol->histories()->create([
                    'symbol_code' => $symbol->code,
                    'high'        => $lastest->high,
                    'low'         => $lastest->low,
                    'date'         => $symbolData['date'],
                    'created_at'  => now(),
                ]); 
                }else
                $symbol->histories()->create([
                    'symbol_code' => $symbol->code,
                    'high'        => $symbolData['high'],
                    'low'         => $symbolData['low'],
                    'date'         => $symbolData['date'],
                    'created_at'  => now(),
                ]);  
        }

         $telegram->sendMessage(env('ADMIN_CHAT_ID'),
              " اطلاعات ".count($symbols).'نماد با موفقیت آپدیت شد  ✅'
            );
    }
}
