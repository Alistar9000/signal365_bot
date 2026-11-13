<?php

namespace App\Services;

use App\Models\Symbol;
use App\Models\Signal;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use App\Services\TopSymbolsService;
use App\Services\SignalService;

class NearSignalService
{
    protected  $signalService;
    protected  $topSymbols;

    public function __construct(SignalService $signalService, TopSymbolsService $topSymbols)
    {
        $this->signalService = $signalService;
        $this->topSymbols = $topSymbols;
    }

    /**
     * داده خام همه سهم‌ها + محاسبه avgHigh و avgLow
     */
    public function getNearSignals()
    {
       
        $top100 = Cache::remember('top100_symbols',now()->addMinutes(60),function() {
           return $this->topSymbols->getTop100();
        });
        $result = Symbol::with('histories')
            ->get()
            ->filter(function($symbol){ return $symbol->histories->count()>=20;})
            ->map(function ($symbol) use ($top100) {
              
                $avg = $this->signalService->calculateAverages($symbol->histories,0,0);
                
                 $lastSignal = Signal::where('symbol_code', $symbol->code)
                    ->latest()
                    ->first();

                $close = $symbol->close;

                $nearBuy = false;
                $nearSell = false;

                if (!$lastSignal && $close >= $avg['avgLow']) {
                    $nearBuy = true;
                } elseif ($lastSignal && $lastSignal->type === 'sell' && $close >= $avg['avgLow']) {
                    $nearBuy = true;
                } elseif ($lastSignal && $lastSignal->type === 'buy' && $close <= $avg['avgHigh']) {
                    $nearSell = true;
                }
                
                // if($nearBuy && !$this->signalService->checkLastPairPerformance($symbol)){
                //     return null;
                // }
                $top100Names = array_column($top100->toArray(),'symbol_name');
                $is_top100 = in_array($symbol->name,$top100Names);

                return [
                    'code'      => $symbol->code,
                    'name'      => $symbol->name,
                    'close'     => $close,
                    'avgHigh'   => $avg['avgHigh'],
                    'avgLow'    => $avg['avgLow'],
                    'near_buy'  => $nearBuy,
                    'near_sell' => $nearSell,
                    'is_top100' => $is_top100 ?? false, // فرض: ستون یا فلگ داریم
                ];
            });

            return $result->filter();
    }

    /**
     * نزدیک به خرید و جزو 100 سهم برتر
     */
    public function getNearBuyTop100($nearSignals = null)
    {
        return Cache::remember('near_buy_top100', now()->addMinutes(60), function () {

             $nearSignals = Cache::remember('nearSignals', now()->addMinutes(60), function () {
                 return $nearSignals ?? $this->getNearSignals();
             });
             
            return $nearSignals->filter(function($s){ return $s['near_buy'] && $s['is_top100'];})->values();
             
        });
    }

    /**
     * نزدیک به خرید و توی لیست هشدار کاربر
     */
    public function getNearBuyAlerts(User $user,$nearSignals = null)
    {
        return Cache::remember("near_buy_alerts_{$user->chat_id}",now()->addMinutes(60), function () use ($user) {
            $alerts = $user->alerts->pluck('symbol_code')->toArray();

            $nearSignals = Cache::remember('nearSignals', now()->addMinutes(60), function () {
                 return $nearSignals ?? $this->getNearSignals();
             });

            return $nearSignals
                ->filter(function($s) use ($alerts){return $s['near_buy'] && in_array($s['code'], $alerts);})
                ->values();
        });
    }

    /**
     * نزدیک به فروش و توی لیست هشدار کاربر
     */
    public function getNearSellAlerts(User $user,$nearSignals = null)
    {
        
        return Cache::remember("near_sell_alerts_{$user->chat_id}", now()->addMinutes(60), function () use ($user) {
            $alerts = $user->alerts->pluck('symbol_code')->toArray();

            $nearSignals = Cache::remember('nearSignals', now()->addMinutes(60), function () {
                 return $nearSignals ?? $this->getNearSignals();
             });

            return $nearSignals
                ->filter(function($s) use ($alerts) {return $s['near_sell'] && in_array($s['code'], $alerts);})
                ->values();
        });
    }

    public function sendPagedMessageBatch($telegram, $chatIds, $symbolsColl, $pageSize, $title,$type)
    {
        $symbolsArray = $symbolsColl->toArray();
        
        if(empty($symbolsArray))
        return;
        
        $chunks = array_chunk($symbolsArray, $pageSize, true);
        $totalPages = count($chunks);
        // foreach ($chunks as $page => $chunk) {
            $text = $title . "\n\n";
            $page = 1;
            foreach ($chunks[0] as $name => $value) {
                $text .= "• #{$value['name']}\n";
            }

            $keyboard = [];
            
            if ($page < $totalPages) {
                $keyboard[] = [['text' => 'بعدی ⬅️', 'callback_data' => $type.'_page_' . ($page + 1)]];
            }
            
            // if ($page > 1) {
            //     $keyboard[] = ['text' => '➡️ قبلی', 'callback_data' => $type.'_page_' . ($page - 1)];
            // }
            
            $text.="\n\n صفحه {$page} از {$totalPages}";
            
            // \Log::info('chatIds type:'.gettype($chatIds));
            if(is_object($chatIds)){
            foreach($chatIds as $chatId)
             $telegram->sendMessageWithInlineKeyboard(
                 $chatId['chat_id'],
                 $text,
                 $keyboard
                );
            }else{
                 $telegram->sendMessageWithInlineKeyboard(
                     $chatIds,
                     $text,
                    $keyboard
                );
            }


            // ارسال به صف برای اجرا در پس‌زمینه
            // dispatch(function() use ($telegram, $chatId, $text, $keyboard) {
            //     $telegram->sendMessage([
            //         'chat_id' => $chatId,
            //         'text' => $text,
            //         'reply_markup' => json_encode(['inline_keyboard' => [$keyboard]])
            //     ]);
            // });
        // }
    }
}
