<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Signal;
use Carbon\Carbon;
use App\Services\KeyboardsService;
use App\Services\Telegram;
use Morilog\Jalali\Jalalian;



class NotifyUsersAboutServiceCommand extends Command
{
    protected $signature = 'notify:users-service';
    protected $description = 'Send notification to users about expiring or expired service';
    
    
    // public function handle(){
         
    //      $symbol = 'IRO1DPAK0001';
    //      $signals = Signal::where('symbol_code', $symbol)
    //         ->orderBy('id', 'desc')
    //         ->take(2)
    //         ->get()
    //         ->reverse();
    //          $buySignal  = $signals->firstWhere('type', 'buy');
    //          $sellSignal = $signals->firstWhere('type', 'sell');

    //      $date_30 = toJalaliDateOnly(now()->subDays(156)) >= $sellSignal->date ? 1 : 0;
         
    //      \Log::info("date : ".$date_30);
    // }
    
    public function handle()
    {
        
        $now = Carbon::now();
         $telegram = new Telegram();
        // ۱. کاربرانی که کمتر از ۵ روز باقی مانده
        $expiringUsers = User::where('vip_until', '>', now())
            ->where('vip_until', '<=', now()->copy()->addDays(5))
            ->where('notified_expiring', false)
            ->get();
 
        foreach ($expiringUsers as $user) {
            // اینجا پیام رو بفرست (مثلا با سرویس تلگرام یا SMS)
            $telegram->sendMessage($user->chat_id, "⏰ فقط کمتر از ۵ روز از اشتراک شما باقی مانده است.");

            // فلگ رو بزنیم که دوباره براش ارسال نشه
            $user->notified_expiring = true;
            $user->save();
        }

        // ۲. کاربرانی که سرویسشون تموم شده
        $expiredUsers = User::where('vip_until', '<', now())
            ->where('notified_expired', false)
            ->get();

        foreach ($expiredUsers as $user) {

           $telegram->sendMessage($user->chat_id, "❌ مشترک گرامی اشتراک شما به پایان رسید!");

            $user->notified_expired = true;
            // $uer->token = null;
            $user->save();
        }
        
       $telegram->sendMessage(
           env('ADMIN_CHAT_ID'),
           'Expiring: '.$expiringUsers->count()."\n".'Expired: '.$expiredUsers->count()
           );
       
    }

    private function sendTelegramMessage($telegram,$chatId, $text ,$type)
    {
        $keyboard = new KeyboardsService();
        
        return $telegram->sendMessageWithInlineKeyboard($chatId,
            $text,
            $type == 1 ? $keyboard->buyMenuNotify(true) : $keyboard->buyMenuNotify(false) 
            );
    }
}

