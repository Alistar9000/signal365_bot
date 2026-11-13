<?php

namespace App\Services;

use App\Models\Symbol;
use App\Models\SymbolHistory;
use App\Models\Signal;
use App\Services\BourseApiService;
use App\Services\Telegram;
use Morilog\Jalali\Jalalian;
use Carbon\Carbon;

class UpdateSymbols
{
    protected $telegram;
    protected $bourseApi;
    
    public function __construct(BourseApiService $bourseApi,Telegram $telegram)
    {
        $this->telegram = $telegram ;
        $this->bourseApi = $bourseApi;
    }
  
  public function update()
  {
    //   $telegram = new Api(config('services.telegram-bot.token'));
       
       $symbols  = $this->bourseApi->getData();

        if (!$symbols) {
            $this->telegram->sendMessage(
                env('ADMIN_CHAT_ID'),
               '❌ هیچ داده‌ای از API دریافت نشد'
            );
            // $this->info('❌ هیچ داده‌ای از API دریافت نشد');
            return;
        }
        
        if (empty($symbols) || count($symbols) <= 1) {
            $this->telegram->sendMessage(
                env('ADMIN_CHAT_ID'),
               '❌ هیچ داده‌ای از API دریافت نشد'
            );
            // $this->info('❌ هیچ داده‌ای از API دریافت نشد');
            return;
        }
        
    //     $gregorian = null;
    //   foreach($symbols as $data){
    //         if($data['namad_code'] == 'IRT1AHRM0001'){
                
    //             $normalJalali = normalJalaliDate($data['last_trade_date']);
    //              if($normalJalali){
    //              $jalaliDate = Jalalian::fromFormat('Y/m/d', $normalJalali);
    //               $gregorian = $jalaliDate->toCarbon();
    //              }
    //               break;
    //         }
    //     }
       

    //     if (!$gregorian || !$gregorian->isToday()) {
    //          $this->telegram->sendMessage(
    //             env('ADMIN_CHAT_ID'),
    //             '⚠️ داده‌ها مربوط به امروز نیستند، عملیات لغو شد.'
    //         );
           
    //         return;
    //     }

        $specificNames = [
            'IRT1AHRM0001',
            'IRT3MOJF0001',
            'IRT1JHSH0001',
            'IRT3TVAF0001',
            'IRT1BIDF0001',
            'IRT1SHTF0001',
            'IRT3NRJF0001',
            'IRT3FF010001',
            'IRT1TMSK0001',
            'IRT3RT010001',
            'IRT1KLID0001',
            'IRT3RT020001',
            'IRT1DARA0001',
            'IRT1PLSH0001',
            'IRTKMOFD0001',
            'IRT3DOXF0001',
            'IRT3SATF0001',
            'IRTKSILV0001',
            'IRTEETFD0001',
        ];

        $filteredItems = array_filter($symbols, function ($item) use ($specificNames) {
            return preg_match('/^IRO[135]/', $item['namad_code'])
            || in_array($item['namad_code'], $specificNames);
        });

        $filteredItems = array_values($filteredItems);
        
        $symbolsData = collect($filteredItems)->map(function ($item) use ($specificNames) {
            
            $symbol = Symbol::where('code',$item['namad_code'])->first();
           
            if($symbol && !in_array($item['namad_code'], $specificNames)){
            $updatedDate = $symbol->updated_at->toDateString();
            $today = now()->toDateString();
            $yesterday = Carbon::yesterday()->toDateString();
            
             if ($updatedDate !=$today && $symbol->final > $item['yesterday_price']) {
                 $this->telegram->sendMessage(
                     env('ADMIN_CHAT_ID'),
                     "نماد {$symbol->name} تعدیل شد."
                     );
                $this->tadilHistories($symbol->code, $symbol->final, $item['yesterday_price']);
            }
            }
            return [
                'name'  => $item['name'],
                'code'  => $item['namad_code'],
                'close' => $item['close_price'],
                'first' => $item['first_price'],
                'high'  => $item['highest_price'],
                'low'   => $item['lowest_price'],
                'final' => $item['final_price'],
                'vhigh' => $item['daily_price_high'],
                'vlow' => $item['daily_price_low'],
                'close_percent' => $item['close_price_change_percent'],
                'date'  => $item['last_trade_date'],
            ];
        })->toArray();
         
        
         
        Symbol::upsert(
            $symbolsData,
            ['code'],
            ['name', 'close', 'first', 'high', 'low', 'final','vhigh','vlow','close_percent', 'date']
        );
        
        return $symbolsData;

  }
  
  public function updateAyar()
  {
     $symbols  = $this->bourseApi->getData();

        if (!$symbols) {
            $this->telegram->sendMessage(
                env('ADMIN_CHAT_ID'),
               '❌ هیچ داده‌ای از API دریافت نشد'
            );
            // $this->info('❌ هیچ داده‌ای از API دریافت نشد');
            return;
        }
        
        if (empty($symbols) || count($symbols) <= 1) {
            $this->telegram->sendMessage(
                env('ADMIN_CHAT_ID'),
               '❌ هیچ داده‌ای از API دریافت نشد'
            );
            // $this->info('❌ هیچ داده‌ای از API دریافت نشد');
            return;
        }
        
    //     $gregorian = null;
    //   foreach($symbols as $data){
    //         if($data['namad_code'] == 'IRT1AHRM0001'){
    //              $normalJalali = normalJalaliDate($data['last_trade_date']);
    //              if($normalJalali){
    //              $jalaliDate = Jalalian::fromFormat('Y/m/d', $normalJalali);
    //               $gregorian = $jalaliDate->toCarbon();
    //              }
    //               break;
    //         }
    //     }
       

    //     if (!$gregorian || !$gregorian->isToday()) {
    //          $this->telegram->sendMessage(
    //             env('ADMIN_CHAT_ID'),
    //             '⚠️ داده‌ها مربوط به امروز نیستند، عملیات لغو شد.'
    //         );
           
    //         return;
    //     }
        
      
        // foreach($symbols as $item){
        $symbols = collect($symbols)->filter(fn($e) => $e['namad_code'] == 'IRTKMOFD0001' || $e['namad_code'] == 'IRTKSILV0001')->map(function($item){
            
            // if($item['namad_code'] == 'IRTKMOFD0001' || $item['namad_code'] == 'IRTKSILV0001'){
            return [
                'name'  => $item['name'],
                'code'  => $item['namad_code'],
                'close' => $item['close_price'],
                'first' => $item['first_price'],
                'high'  => $item['highest_price'],
                'low'   => $item['lowest_price'],
                'final' => $item['final_price'],
                'vhigh' => $item['daily_price_high'],
                'vlow' => $item['daily_price_low'],
                'close_percent' => $item['close_price_change_percent'],
                'date'  => $item['last_trade_date'],
            ];
            
            // }
        }); 
        // };
        
        return $symbols->toArray();
  }
  
   private function tadilHistories($code, $final, $yprice)
    {

        $tadil = floor($final / $yprice * 10000) / 10000;
        SymbolHistory::where('symbol_code', $code)
            ->update([
                'high' => \DB::raw("FLOOR(high / {$tadil})"),
                'low' => \DB::raw("FLOOR(low / {$tadil})"),
            ]);
        $signal = Signal::where('symbol_code', $code)->latest('id')->first();
        if ($signal && $signal->type == 'buy') {
            
            $signal->update([
                'close' =>  floor($signal->close / $tadil),
            ]);
        }
    }
  
}