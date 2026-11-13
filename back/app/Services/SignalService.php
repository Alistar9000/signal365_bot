<?php
namespace App\Services;

use App\Models\Signal;
use App\Models\Symbol;
use App\Models\SymbolHistory;
use App\Models\User;
use App\Models\Setting;
use App\Models\GenericModel;
use App\Services\BourseApiService;
use App\Services\TopSymbolsService;
use App\Services\SendMessageService;
use App\Services\UpdateSymbols;
use App\Services\Telegram;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Morilog\Jalali\Jalalian;


class SignalService
{
    protected $telegram;
    protected $topSymbols;
    protected $apiService;
    protected $sendMessage;
    protected $updateSymbols;
    public function __construct(BourseApiService $apiService, TopSymbolsService $topSymbols,SendMessageService $sendMessage,UpdateSymbols $updateSymbols,Telegram $telegram)
    {

        $this->telegram   = $telegram;
        $this->topSymbols = $topSymbols;
        $this->apiService = $apiService;
        $this->sendMessage = $sendMessage;
        $this->updateSymbols = $updateSymbols;

    }

    public function calculateAverages($history, $high, $low)
    {
        $highSum = 0;
        $lowSum  = 0;
        // $validRecords = collect($history)->filter(function($r){return is_object($r) && isset($r->high, $r->low);});

       $highSum = collect($history)->sum('high') + $high;
       $lowSum  = collect($history)->sum('low')  + $low;
       
       $hi = round($highSum/20);
       $lo = round($lowSum/20);
        return [
            'avgHigh' => $hi,
            'avgLow'  => $lo,
        ];
    }

    private function checkBuySellConditions($TodayData)
    {

        // [$close, $first, $vhigh, $vlow, $avgHigh, $avgLow] = $TodayData;
        $signalType                                        = null;

        $close = $TodayData['close'];
        $first = $TodayData['first'];
        $vhigh = $TodayData['vhigh'];
        $vlow = $TodayData['vlow'];
        $avgHigh = $TodayData['avgHigh'];
        $avgLow = $TodayData['avgLow'];
        
        $isPositiveCandle = $close >= $first;
        $isNegativeCandle = $close <= $first;
        $isBuyQueue       = $close == $vhigh;
        $isSellQueue      = $close == $vlow;

        if ($close > $avgHigh
            && $first > $avgHigh
            && $isPositiveCandle && ! $isSellQueue) {
            $signalType = 'buy';
        }

        if ($close < $avgLow
            && $first < $avgLow
            && $isNegativeCandle && ! $isBuyQueue) {
            $signalType = 'sell';
        }

        return $signalType;

    }
    
    public function checkLastPairPerformance(Symbol $symbol)
    {
        // گرفتن آخرین 2 سیگنال (باید buy و بعد sell باشه)
        $signals = Signal::where('symbol_code', $symbol->code)
            ->orderBy('id', 'desc')
            ->take(2)
            ->get()
            ->reverse(); // تا ترتیب buy → sell بشه

        if ($signals->count() < 2) {
            return false; // جفت سیگنال کافی نیست
        }

        $buySignal  = $signals->firstWhere('type', 'buy');
        $sellSignal = $signals->firstWhere('type', 'sell');

        if (! $buySignal || ! $sellSignal) {
            return false; // جفت معتبر پیدا نشد
        }

        // محاسبه بازدهی جفت
        $buyPrice  = $buySignal->close;
        $sellPrice = $sellSignal->close;
        
        if($buyPrice == 0 || $sellPrice == 0){
            
            return false;
        }
        
        $return = round((($sellPrice - $buyPrice) / $buyPrice) * 100,2);
        $date_30 = toJalaliDateOnly(now()->subDays(25)) >= $sellSignal->date ? 1 : 0;
        // محاسبه میزان اصلاح از آخرین فروش تا قیمت فعلی
        // $correction = (($symbol->close - $sellPrice) / $sellPrice) * 100;

        // شرط: بازدهی جفت >= 20% و اصلاح <= -30%
        // if ($return < 20 || $return >= 20 && $correction <= -30) {
        
        if ($return < 20 || $date_30 == 1) {
            return true;
        }

        return false;
    }

    private function shouldSendSignalToUser(User $user, Symbol $symbol, array $top100): array
    {
        $inAlerts = $user->alerts()
            ->where('symbol_code', $symbol->code)
            ->exists();

        $inTop100 = collect($top100)->contains('symbol_name',$symbol->name);

        return [$inAlerts, $inTop100];
    }

    private function formatSignalMessage(Symbol $symbol, string $type, string $source): string
    {
        $history     = $this->topSymbols->get10SignalsHistory($symbol->code,1);
        $historyText = '';

        foreach ($history as $index => $value) {
            $historyText .= $value['return'] >= 0 ? "🟢 " : "🔴 ";
            $historyText .= $value['return']. " %\n";
        }
        $emoji  = $type === 'buy' ? "🟢📈" : "🔴📉";
        $action = $type === 'buy' ? "سیگنال خرید" : "سیگنال فروش";

        $text = " $emoji $action "."\n\n"."📌 نماد: #<b>".$symbol->name. "</b>\n" .
            "💵 آخرین قیمت: ".$symbol->close." \u{200E} (".$symbol->close_percent."%)\n" ;
        if($type === 'buy'){    
        $text.= "▪️️️️بازدهی 5 سیگنال آخر:\n"
            . $historyText . "\n\n" ;
        }
        $text.= "📦 منبع سیگنال : $source \n";
        $text.= "⏰ زمان: ".toJalaliDateOnly(Carbon::now())." ".Carbon::now('Asia/Tehran')->format('H:i');
        
        return $text;

    }

    private function sendToVipUsers(Symbol $symbol, string $type, array $top100)
    {

        $vipUsers = User::where('vip_until', '>', Carbon::now())->get();
        
        $vipUsers->chunk(50)->each(function($usersChunk) use ($symbol,$type,$top100){
            foreach($usersChunk as $user){
                
                // if($user->chat_id != 407749551)
                //  continue;
                 
                 $valid = $this->shouldSendSignalToUser($user, $symbol, $top100);
                 $message = '';
                 if($valid[0] && $valid[1] )
                 $message = $this->formatSignalMessage($symbol, $type,'سهام برتر و لیست هشدار');
                 elseif($valid[0])
                 $message = $this->formatSignalMessage($symbol, $type,'لیست هشدار');
                 elseif($valid[1])
                 $message = $this->formatSignalMessage($symbol, $type,'سهام برتر');
                
                 if($message !== '')
                 $this->telegram->sendMessage(
                    $user->chat_id,
                    $message
                     );
                }
        });
    }

    public function sendToAdmin($symbols)
    {
        
    
        if(empty($symbols))
        return;
        $text = '';
        foreach ($symbols as $symbol) {
            $text .= $symbol['type'] === 'buy' ?  "🟢 ":"🔴 ";
            $text .= $symbol['name'] . "\n";
        }
        $this->telegram->sendMessage(
            env('ADMIN_CHAT_ID'),
            $text

        );
    }


   

    public function checkSignal()
    {
        //  $this->telegram->sendMessage([
        //     'chat_id' => env('ADMIN_CHAT_ID'),
        //     'text' => "signal running.."
        //     ]);
            
        // \Log::info('running signal service');    
        $adminSignals = [];
        $top          = $this->topSymbols;
        
        $symbolsData = $this->updateSymbols->update();
         
        if(!$symbolsData || empty($symbolsData)){
            return;
        }
        // $top100 = $top->getTop100(); 
        $top100       = Cache::remember('top100_symbols', now()->addMinutes(240), function () use ($top) {
            return $top->getTop100();
        });
       
        foreach ($symbolsData as $data) {

            if($data['code'] === 'IRTKMOFD0001' || $data['code'] === 'IRTKSILV0001'){
                continue;
            }
            
            $symbol = Symbol::where('code', $data['code'])->first();
            if (! $symbol) {
                continue;
            }
            
            $history = $symbol->histories()->orderBy('id', 'asc')->skip(1)->take(19)->get();
            if ($history->isEmpty() || $history->count() < 19) {
                continue;
            }

            // میانگین‌های 20 روزه
            $high = $data['high'];
            $low  = $data['low'];

            $avg = $this->calculateAverages($history, $high, $low);

            $todayData = [
                'close'   => $data['close'],
                'first'  => $data['first'],
                'vhigh'   => $data['vhigh'],
                'vlow'    => $data['vlow'],
                'avgHigh' => $avg['avgHigh'],
                'avgLow'  => $avg['avgLow'],
            ];

            $signalType = $this->checkBuySellConditions($todayData);
            if (! $signalType) {
            
                continue;
            }

            $lastSignal = Signal::where('symbol_code', $symbol->code)->latest('id')->first();

            if ($lastSignal && $lastSignal->type === $signalType) {
                continue;
            }
            
            $valid = false;

            if ($signalType === 'buy' && ! $lastSignal || $signalType === 'buy' && $lastSignal && $this->checkLastPairPerformance($symbol)) {
                $valid = true;
            }
            if ($signalType === 'sell' && ! $lastSignal) {
                continue;
            }
            $checkTime = Carbon::now('Asia/Tehran')->format('H:i');
            $specificDomain = 3.5;
            
        $specificNames = [
            'IRT1AHRM0001',
            'IRT3MOJF0001',
            'IRT1JHSH0001',
            'IRT3TVAF0001',
            'IRT1BIDF0001',
            'IRT1SHTF0001',
            'IRT3NRJF0001',
            'IRT3DOXF0001',
        ];

        $domainTable = Setting::pluck('signal_domain')->first();  
        if(in_array($symbol->code,$specificNames)){
            $domainBuyPercent = $domainTable+1;  
            $domainSellPercent = $domainTable+1;  
        }else{
             $domainBuyPercent = $domainTable+0.2;  
            $domainSellPercent = $domainTable; 
        }
       
            
            if ($signalType === 'buy' && $data['close_percent'] > $domainBuyPercent && $checkTime >= '10:00' && $checkTime <= '12:00'  || $signalType === 'buy' && $checkTime > '12:00') {
                Signal::create([
                    'symbol_code' => $symbol->code,
                    'type'        => $signalType,
                    'close'       => $data['close'],
                    'valid'       => $valid,
                    'date'        => $data['date'],
                ]);
                // if ($valid) {
                 
                    $adminSignals[] = ['name'=>$symbol->name,'type'=>'buy'];
                    
                    $this->sendToVipUsers($symbol, $signalType, $top100->toArray());
                // }

            } 
            if($signalType == 'sell' && $data['close_percent'] < -$domainSellPercent && $checkTime >= '11:00' || $signalType === 'sell' && $checkTime > '12:00') {
                Signal::create([
                    'symbol_code' => $symbol->code,
                    'type'        => $signalType,
                    'close'       => $data['close'],
                    'date'        => $data['date'],
                ]);

                $adminSignals[] = ['name'=>$symbol->name,'type'=>'sell'];
                $this->sendToVipUsers($symbol, $signalType, $top100->toArray());
            
                Cache::forget('top100_symbols');
            }

        }
        $this->sendToAdmin($adminSignals);
    }
    public function checkSignalAyar()
    {
        //  $this->telegram->sendMessage([
        //     'chat_id' => env('ADMIN_CHAT_ID'),
        //     'text' => "signal running.."
        //     ]);
        
        // \Log::info('run ayar');    
        $adminSignals = [];
        $top          = $this->topSymbols;
        
        $symbols = $this->updateSymbols->updateAyar();
       
        if(!$symbols || empty($symbols)){
            return;
        }
        
        $top100  =  $top->getTop100();
        
         foreach($symbols as $data){
            $symbol = Symbol::where('code', $data['code'])->first();
            if (! $symbol) {
                return;
            }

            $history = $symbol->histories()->orderBy('id', 'asc')->skip(1)->take(19)->get();
            if ($history->isEmpty() || $history->count() < 19) {
                return;
            }
            // \Log::info('history : '.json_encode($history));  
            // میانگین‌های 20 روزه
            $high = $data['high'];
            $low  = $data['low'];

            $avg = $this->calculateAverages($history, $high, $low);
           
            $todayData = [
                'close'   => $data['close'],
                'first'  => $data['first'],
                'vhigh'   => $data['vhigh'],
                'vlow'    => $data['vlow'],
                'avgHigh' => $avg['avgHigh'],
                'avgLow'  => $avg['avgLow'],
            ];
            //  \Log::info('avg : '.json_encode($todayData));  
            $signalType = $this->checkBuySellConditions($todayData);
            // \Log::info('signal type : '.$signalType);  
            if (! $signalType) {
                return;
            }

            $lastSignal = Signal::where('symbol_code', $symbol->code)->latest('created_at')->first();

            if ($lastSignal && $lastSignal->type === $signalType) {
                return;
            }
            $valid = true;

            // if ($signalType === 'buy') {
            //     $valid = true;
            // }
            if ($signalType === 'sell' && ! $lastSignal) {
                return;
            }
            $checkTime = Carbon::now('Asia/Tehran')->format('H:i');
            $specificDomain = 3.5;
       
            if ($signalType === 'buy' && $data['close'] > $data['first']) {
                //  \Log::info('signal : '.true );  
                Signal::create([
                    'symbol_code' => $symbol->code,
                    'type'        => $signalType,
                    'close'       => $data['close'],
                    'valid'       => $valid,
                    'date'        => $data['date'],
                ]);
              
                    $this->sendToVipUsers($symbol, $signalType, $top100->toArray());
                    $adminSignals[] = ['name'=>$symbol->name,'type'=>'buy'];
                

            } 
            if($signalType == 'sell' && $data['close'] < $data['first']) {
                Signal::create([
                    'symbol_code' => $symbol->code,
                    'type'        => $signalType,
                    'close'       => $data['close'],
                    'date'        => $data['date'],
                ]);

                $this->sendToVipUsers($symbol, $signalType, $top100->toArray());
                $adminSignals[] = ['name'=>$symbol->name,'type'=>'sell'];
                Cache::forget('top100_symbols');
            }

         }
        $this->sendToAdmin($adminSignals);
    }
    
   

}
