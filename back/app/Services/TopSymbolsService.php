<?php

namespace App\Services;

use App\Models\Signal;
use App\Models\User;
use App\Models\Symbol;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Telegram\Bot\Keyboard\Keyboard;
use Illuminate\Support\Facades\Cache;

class TopSymbolsService
{
    
    public function getTop100(){
         
        if(Signal::count() === 0)
          return;
           // $top100 = Cache::remember('top100_symbols_for_today_signals',now()->addMinutes(5),function (){
        //     return $this->getTop100();
        // });
        
        $symbols = Symbol::all();
        if($symbols->isEmpty())
        return;
        // return Cache::rememberForever('top100_symbols',function() use($symbols){
            
        $results = [];
        foreach ($symbols as $index=>$symbol) {
            // گرفتن 21 سیگنال آخر (جدید → قدیم)
            // $signals = $symbol->signals()
            //     ->latest('created_at')
            //     ->take(21)
            //     ->get()
            //     ->reverse()
            //     ->values();
            
            $signals = $symbol->signals()
                ->orderByDesc('id')
                ->get();
                
            if($signals->isEmpty() || $signals->count()==1){
                continue;
            }
            
            $weightedScore    = 0;
            $pairCount        = 0;
            $profitCount      = 0;
            $lossCount        = 0;
            $totalReturn      = 0;
            $lastSignalReturn = null;
            $pairs            = [];
            $recentPerformance = 0;
            
        $openSignal = false;
            foreach($signals as $index => $signal){
                
        /* Down Trend  */ 
        // if ($index == 0 && $signal->type === 'buy' && $signal->valid) {
        
        /* UP Trend */  
        if ($index == 0 && $signal->type === 'buy') {
              
                  $lastSignalReturn = round((($symbol->close - $signal->close) / $signal->close) * 100, 2);
                $openSignal = true;
                  continue;
              }
            //   if($signal->type === 'buy' && $signal->valid){
            
              if($signal->type === 'buy'){
                   $prev = $signals[$index-1]->close;
                   $return = round((($prev - $signal->close ) / $signal->close ) * 100, 2);
                    $totalReturn += $return;
                   
                    // $totalReturn += $return * (10 - $index);
                    $pairCount++;
                    // $recentPerformance += $return * (10 - $index);
                    if ($return > 0) {
                        $profitCount++;
                        $pairs[] =['status' => 'u','return' => $return];
                    } else {
                        $lossCount++;
                        $pairs[] =['status' => 'd','return' => $return];
                    }
                   
               }
               if($pairCount == 5){
                   break;
               }
                   
            }
            
            if($pairCount == 0){
                continue;
            }
            
            $score = round(0.2 * $pairCount + 0.3 * (($profitCount / $pairCount) * 100) + 0.5 * ($totalReturn / $pairCount), 2);
            // $score = $tr;
            if($pairCount > 1 || $pairCount == 1 && $totalReturn > 50)
            $results[] = [
                'symbol_name'        => $symbol->name,
                'symbol_code'        => $symbol->code,
                'score'              => $score,
                'profit_count'       => $profitCount,
                'loss_count'         => $lossCount,
                'last_signal_return' => $lastSignalReturn,
                'pair_count'         => $pairCount,
                'pairs'              => $pairs 
            ];
        }
        return collect($results)
            ->sortByDesc('score')
          
           /* UP Trend*/
            ->take(200)
            
           /* Down Trend*/
           // ->take(100)
        
            ->values();
    //   });
    }
    

    public function getPage(array $symbols, int $page = 1, int $perPage = 10, string $title = '',string $symbolCode = null)
    {
        
        $totalPages = ceil(count($symbols) / $perPage);
        $page       = max(1, min($page, $totalPages)); // اطمینان از محدوده صفحه
        $offset      = ($page - 1) * $perPage;
        $pageSymbols = array_slice($symbols, $offset, $perPage);

        switch ($title) {
            case "top100":
                
                $text = "💹 100 سهم برتر -  صفحه {$page} از {$totalPages}\n\n";
                foreach ($pageSymbols as $index => $symbol) {
                    $text .= ($offset + $index + 1) . ". *{$symbol['symbol_name']}*\n";
                    // $text .= "📊 امتیاز: {$symbol['score']}\n";
                    $text .= "✅ سود: {$symbol['profit_count']}  |  ❌ زیان: {$symbol['loss_count']}\n";
                    if ($symbol['last_signal_return'] !== null) {
                        $text .= "🔔 سیگنال باز:\u{200E} *{$symbol['last_signal_return']}%*\n";
                    }
                    $text .= "\n";
                }
                break;
            case "signals_history":
                $getsymbol = Symbol::where('code',$symbolCode)->first();
                $text = "📊  بازدهی ۱۰ سیگنال آخر *#{$getsymbol->name}*";
                $text.= " (صفحه {$page} از {$totalPages})\n\n";
                
                foreach ($pageSymbols as $index => $symbol) {
                
            if ($symbol['sell_date'] == '—') {
                 $text .= "🔹سیگنال " . ($offset + $index + 1)."  *( باز )*\n";
            } else {
                $text .= "🔹سیگنال " . ($offset + $index + 1) . "\n";
            }
            
            if($symbol['return'] >= 0)
           $emoji = "📈";
           
             if($symbol['return'] < 0)
           $emoji = "📉";
         
            $text .= "   {$emoji} بازدهی: \u{200E} *{$symbol['return']}*%\n";
            $text .= "   🟢 خرید: " . $symbol['buy_date'] . "\n";
            $text .= "   🔴 فروش: " . $symbol['sell_date'] . "\n\n";
            
            // if($page == $totalPages){
            // $text .= "━━━━━━━━━━━━━━━\n";
            // $text .= "📈 موفق: {$profitCount}\n";
            // $text .= "📉 ناموفق: {$lossCount}\n";
            // }
        }
                
                break;

            case "today_signals":
                $text = "💹 سیگنال های امروز - صفحه {$page} از {$totalPages}\n\n";
                foreach ($pageSymbols as $index => $symbol) {
                     $text.= "▪️ {$symbol['name']} → {$symbol['emoji']} ⏰ {$symbol['time']}\n";
                }
                break;
            case "nearSignalTop100":

                $text = "🔹 نزدیک به سیگنال خرید (سهام برتر)\n\n";
              
                 foreach ($pageSymbols as  $symbol) {
                     $text .= "• #{$symbol['name']}\n";
                }

                $text.="\n\n صفحه {$page} از {$totalPages}";
                break;   

            case "nearSignalBuyAlert":

                $text = "🔹 نزدیک به سیگنال خرید (لیست هشدار)\n\n";
                
                 foreach ($pageSymbols as  $symbol) {
                     $text .= "• #{$symbol['name']}\n";
                }

                $text.="\n\n صفحه {$page} از {$totalPages}";
                break;    
            case "nearSignalSellAlert":

                $text = "🔻 نزدیک به سیگنال فروش (لیست هشدار)\n\n";
              
                 foreach ($pageSymbols as  $symbol) {
                     $text .= "• #{$symbol['name']}\n";
                }
                $text.="\n\n صفحه {$page} از {$totalPages}";
                break;    
              
        }

        // ساخت کیبورد
        $keyboard = [];
        
        if($symbolCode)
        $title = $title."*".$symbolCode;
        
        if(count($symbols) > $perPage){
            
         if ($page > 1 && $page<$totalPages) {
             if( !Str::startsWith($title, 'nearSignal')){
            $keyboard[] = [
                
                ['text' => '➡️ قبلی', 'callback_data' => "{$title}_page_" . ($page - 1)],
               ['text' => 'بعدی ⬅️', 'callback_data' => "{$title}_page_" . ($page + 1)],
                
            ];
            $keyboard[] =[
                       
            ['text' => '🔙 بازگشت', 'callback_data' => 'back_to_menu']
                
                ];
                 
             }else{
                     $keyboard[] = [
                
               ['text' => '➡️ قبلی', 'callback_data' => "{$title}_page_" . ($page - 1)],
                ['text' => 'بعدی ⬅️', 'callback_data' => "{$title}_page_" . ($page + 1)],
                
            ];
                    
                }
         }

        if ($page == 1) {
             if( !Str::startsWith($title, 'nearSignal')){
                 
                  $keyboard[] = [
                
                ['text' => 'بعدی ⬅️', 'callback_data' => "{$title}_page_" . ($page + 1)]
            ];
            
               $keyboard[] =  [
                
            ['text' => '🔙 بازگشت', 'callback_data' => 'back_to_menu']
            ];
             }
           
            else
            
             $keyboard[] = [
                
                ['text' => 'بعدی ⬅️', 'callback_data' => "{$title}_page_" . ($page + 1)]
            ];
            
            
        }
        
        if ($page == $totalPages) {
            if( !Str::startsWith($title, 'nearSignal')){
                
                 $keyboard[] = 
                     [  
                   ['text' => '➡️ قبلی', 'callback_data' => "{$title}_page_" . ($page - 1)]
                
                ];
                $keyboard[] = [  
            ['text' => '🔙 بازگشت', 'callback_data' => 'back_to_menu']
                
                ];
            }
           
                else 
                
                  $keyboard[] = [ 
                   ['text' => '➡️ قبلی', 'callback_data' => "{$title}_page_" . ($page - 1)]
                
                ];
                
                
        }
        }else{
         
        $keyboard[] = [
            ['text' => '🔙 بازگشت', 'callback_data' => 'back_to_menu']
        ];
         }
         
         
        return [
            'text'     => $text,
            'keyboard' => $keyboard,
        ];
    }

    public function get10SignalsHistory($symbolCode,$type = null)
    {
        $signals = Signal::where('symbol_code', $symbolCode)
            ->orderByDesc('id')
            ->get(); 

        $returns   = [];
        $pairCount = 0;
        if(!$signals || $signals->count() == 0 )
        return [];
        
         foreach($signals as $index => $signal){
                
            //   if ($signal->type === 'buy' && $signal->valid) {
               if ($signal->type === 'buy') {
                   if($index == 0){
                       
                       if($type){
                           continue;
                       }
                   $symbol = Symbol::where('code',$symbolCode)->first();
                    $pairCount++;
                    $returns[] = [
                    'buy_date'  => toJalaliDateOnly($signal->date),
                    'sell_date' => '—', // فروش نداره
                    'return'    => round((($symbol->close - $signal->close) / $signal->close) * 100, 2),
                ];
                   }
                   else{
                    $prev = $signals[$index-1];
                   $return = round((($prev->close - $signal->close ) / $signal->close ) * 100, 2);
                   $returns[] = [
                    'buy_date'  => toJalaliDateOnly($signal->date),
                    'sell_date' => toJalaliDateOnly($prev->date),
                    'return'    => $return,
                   ];
                   $pairCount++;
                   }
               }
             
               if($pairCount == 5){
                   break;
               }
                   
            }

        return array_values($returns);
    }

    public function getTodaySignals(User $user)
    {
        $today = Carbon::today();
        
        
        $signals = Signal::with('symbol')
            ->whereDate('created_at', $today)
            ->orderBy('created_at', 'asc') // مرتب‌سازی بر اساس ساعت
            ->get();

         $results = [];
        if ($signals->isEmpty()) {
            return $results ;
        }
        
        // $top100 = Cache::remember('top100_symbols_for_today_signals',now()->addMinutes(5),function (){
        //     return $this->getTop100();
        // });
        
        $top100 = $this->getTop100();

        foreach ($signals as $signal) {
            $emoji = $signal->type === 'buy' ? '🟢 خرید' : '🔴 فروش';
            $time  = Carbon::parse($signal->created_at)
                ->setTimezone('Asia/Tehran')
                ->format('H:i');
        //   $symbol = $signal->symbol();
        
         $inAlerts = $user->alerts()
            ->where('symbol_code', $signal->symbol->code)
            ->exists();

        $inTop100 = collect($top100)->contains('symbol_name',$signal->symbol->name);
        
        if($inAlerts && $signal->type === 'buy' && $signal->valid || $inTop100 && $signal->type === 'buy' && $signal->valid || $inAlerts && $signal->type === 'sell' || $inTop100 && $signal->type === 'sell' )
            $results[]=[
                'name' => $signal->symbol->name,
                'emoji' => $emoji,
                'time' => $time
            ];
        }

        return $results;
    }

}
