<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SignalService;
use App\Services\UpdateSymbols;
use App\Services\Telegram;
use App\Models\Symbol;
use App\Models\SymbolHistory;
use App\Services\BourseApiService;
use Illuminate\Support\Facades\Http;


class SignalCommand extends Command
{
    protected $signature = 'update:signal';
    protected $description = 'ارسال سیگنال‌ها برای کاربران ویژه در تایم بازار';

    public function handle(SignalService $signalService)
    {
        // $telegram = new Telegram();
        //  $telegram->sendMessage(
        //     env('ADMIN_CHAT_ID'),
        //     "signal running.."
        //     );
        
        $signalService->checkSignal();
        // $symbols = $updateSymbols->updateAyar();
       
        // foreach($symbols as $index => $data){
        //     $symbol = Symbol::where('code', $data['code'])->first();
        //     \Log::info("symbol $index:".json_encode($symbol));
        // }
        
//         $url = "https://apis.sourcearena.ir/api/?token=4a1a9e71334b718b42a79a70c761592f&name=اطلس&days=20";
//         $response = Http::timeout(10)->get($url);
//         $code = Symbol::where('code','IRT3SATF0001')->pluck('code')->first();
//         if ($response->successful()) {
//                  $data = $response->json();
//                 //  $datas = array_reverse($datas);
//                 for($i= count($data)-1;$i>=0;$i--){
//                     SymbolHistory::create([
//                         'symbol_code' => $code,
//                         'high' => $data[$i]['highest_price'],
//                         'low' => $data[$i]['lowest_price'],
//                         'date' => $data[$i]['date']
//                         ]);
//                 } 
// }
//         $symbols = Symbol::where('date', 'NOT LIKE', '%1404/11/7%')->get();
//         foreach($symbols as $symbol){
//             $name = $symbol->name;
             
//             $url = "https://apis.sourcearena.ir/api/?token=4a1a9e71334b718b42a79a70c761592f&name={$name}";
//              $response = Http::timeout(10)->get($url);
           
//             if ($response->successful()) {
//                 $data = $response->json();
//                 // $datas = array_reverse($datas);
                
//                 // for($i= count($datas)-1;$i>0;$i--)
                
//                 // Symbol::updateOrCreate([
//                 //     'symbol_code' => $symbol->code,
//                 //     'high'        => $datas[$i]['highest_price'],
//                 //     'low'         => $datas[$i]['lowest_price'],
//                 //     'date'         => $datas[$i]['date'],
//                 //     'created_at'  => now(),
//                 // ]);
//                 Symbol::where('name', $name)->update([
//     'close' => $data['close_price'],
//     'first' => $data['first_price'],
//     'high' => $data['highest_price'],
//     'low' => $data['lowest_price'],
//     'final' => $data['final_price'],
//     'vhigh' => $data['daily_price_high'],
//     'vlow' => $data['daily_price_low'],
//       'close_percent' => rtrim($data['close_price_change_percent'],"%"),
// ]);

                    
//             } else {
//               \Log::info('get data failed: '.$name);
//             }
//         }
       
    }
    
}


