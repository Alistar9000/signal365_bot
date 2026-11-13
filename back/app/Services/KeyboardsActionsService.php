<?php
namespace App\Services;

use App\Models\User;
use App\Models\UserAlert;
use App\Models\PaymentToken;
use App\Models\Tutorial;
use App\Models\Setting;
use App\Services\KeyboardsService;
use App\Services\TopSymbolsService;
use App\Services\NearSignalService;
use App\Services\Telegram;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Carbon\Carbon;



class KeyboardsActionsService
{
    protected $telegram;
    protected $keyboards;
    protected $nearSignals;
    public function __construct(KeyboardsService $keyboards,NearSignalService $nearSignals,Telegram $telegram)
    {
        $this->telegram  = $telegram;
        $this->keyboards = $keyboards;
        $this->nearSignals = $nearSignals;
    }

    private function editMessage($chatId, $messageId, $text, $keyboard = [])
    {
     
        $this->telegram->editMessageText($chatId, $messageId, $text, $keyboard);
    }

    public function vipOrPromptPurchase($chatId, $messageId, $user)
    {
        if (! $user || ! $user->isVip()) {
            $text     = "⚠️ قبل از دسترسی به این بخش ابتدا باید سرویس را خریداری کنید.";
            $keyboard =
            $this->editMessage($chatId, $messageId, $text, $this->keyboards->buyMenu(false));
            return false; // کاربر VIP نیست
        }

        return true; // کاربر VIP هست
    }

    public function handleBuyOrRenew($chatId, $messageId, $from)
    {
        $user     = User::where('chat_id', $chatId)->first();
        $isVip    = $user && $user->isVip();
        $daysLeft = $user->remaining_days;

        if ($isVip) {

            $text = "🌟 شما کاربر ویژه هستید.\n\n⏳ زمان باقی‌مانده سرویس: *{$daysLeft} روز*";
        } elseif ($user->is_vip) {
            $text = "⚠️ زمان سرویس شما به پایان رسیده.\n\n برای خرید سرویس روی دکمه زیر بزنید 👇";
        } else {
            $text = "⚠️ شما هنوز کاربر ویژه نیستید.\n\n برای خرید سرویس روی دکمه زیر بزنید 👇";
        }

        $this->editMessage($chatId, $messageId, $text, $this->keyboards->buyMenu($isVip));
    }

    /** 📌 بازگشت به منوی اصلی */
    public function handleBackToMenu($chatId, $messageId, $from)
    {
        
         $user = User::where('chat_id',$chatId)->first();
      
        $text = "سلام 👋 من ربات سیگنال هوشمند هستم و بهت کمک میکنم که بتونی بهتر ترید کنی ، از منو یکی از گزینه های زیر رو انتخاب کن:";

        $this->editMessage($chatId, $messageId, $text, $this->keyboards->mainMenu($user));

        $user->clearState();
    }
    
    public function handleBackToAlertList($chatId, $messageId, $from)
    {
        $this->handleAlertsList($chatId, $messageId, $from);
    }

    /** 📌 لیست هشدار */
    public function handleAlertsList($chatId, $messageId, $from)
    {
        $user = User::where('chat_id', $chatId)->first();
        if (! $this->vipOrPromptPurchase($chatId, $messageId, $user)) {
            return;
        }

        $alerts = UserAlert::with('symbol')->where('user_chat_id',$user->chat_id)->get()->pluck('symbol.name');
        
        $count = $alerts->count();
         $text  = "📢 لیست هشدارهای شما:\n";
        $text .= "تعداد نمادها: *{$count}*\n\n";
        
        if ($count > 0) {
            $text .="*".implode(" - ", $alerts->toArray())."*";
            
        } else {
            $text .= "⚠️ *هنوز هیچ نمادی اضافه نشده است.*";
        }
        $text.="\n\n";
        // کیبورد مخصوص این بخش
        $keyboard = $this->keyboards->alertsMenu();

        $this->editMessage($chatId, $messageId, $text, $keyboard);
        $user->clearState();
    }

    /** 📌 100 سهم برتر */
    public function handleTop100($chatId, $messageId, $from)
    {
        $user = User::where('chat_id', $chatId)->first();
        if (! $this->vipOrPromptPurchase($chatId, $messageId, $user)) {
            return;
        }
        $service = new TopSymbolsService();
        $symbols = Cache::remember("top100_symbols", now()->addMinutes(10), function () use ($service) {
           
             return $service->getTop100();
        });
        
        if ($symbols->isNotEmpty()) {
            $pageData = $service->getPage($symbols->toArray(), 1, 5, 'top100');
            $this->editMessage($chatId, $messageId, $pageData['text'], $pageData['keyboard']);
        } else {
            $this->editMessage($chatId, $messageId, "لیست خالی است!", $this->keyboards->backButton());
        }

        $user->clearState();
    }

    public function handlePages($chatId, $messageId, $page, $type)
    {
        $service = new TopSymbolsService();
       $nearSignalService = $this->nearSignals;
       
       if(Str::startsWith($type, 'signals_history')){
           $t = explode('*',$type);
           $type = $t[0];
           $symbolCode = $t[1];
       }
        switch ($type) {
            case "top100":
                $symbols = Cache::remember($type, now()->addMinutes(10), function () use ($service) {
                    return $service->getTop100();
                });
                
                $pageData = $service->getPage($symbols->toArray(), $page, 5, $type);
                
                break;
            case "signals_history":
                $symbols = Cache::remember($type.'*'.$symbolCode, now()->addMinutes(5), function () use ($service, $symbolCode) {
                    
                    return $service->get10SignalsHistory($symbolCode);
                });
                
                $pageData = $service->getPage($symbols, $page, 4, $type,$symbolCode);
                break;
            case "today_signals":
                 $user = User::where('chat_id', $chatId)->first();
                $symbols = Cache::remember($type.'_'.$chatId, now()->addMinutes(1), function () use ($service,$user) {
                    return $service->getTodaySignals($user);
                });
                //  $symbols =  $service->getTodaySignals($user);
                $pageData = $service->getPage($symbols, $page, 10, $type);
                break;
            case "nearSignalTop100":
                $symbols = Cache::remember("near_buy_top100", now()->addMinutes(60), function () use ($nearSignalService) {
                    return $nearSignalService->getNearBuyTop100();
                });
                $pageData = $service->getPage($symbols->toArray(), $page, 10, $type);
                break;
            case "nearSignalBuyAlert":
                $symbols = Cache::remember("near_buy_alerts_{$chatId}", now()->addMinutes(60), function () use ($nearSignalService,$chatId) {
                     $user = User::where('chat_id',$chatId)->first();
                    return $nearSignalService->getNearBuyAlerts($user);
                });
                $pageData = $service->getPage($symbols->toArray(), $page, 10, $type);
                break;
            case "nearSignalSellAlert":
                $symbols = Cache::remember("near_buy_alerts_{$chatId}", now()->addMinutes(60), function () use ($nearSignalService,$chatId) {
                    $user = User::where('chat_id',$chatId)->first();
                    return $nearSignalService->getNearSellAlerts($user);
                });
                $pageData = $service->getPage($symbols->toArray(), $page, 10, $type);
                break;
            

        }

        $this->editMessage(
            $chatId,
            $messageId,
            $pageData['text'],
            $pageData['keyboard']
        );
    }

    /** 📌 بازدهی سهم خاص */
    public function handleSignalsHistory($chatId, $messageId, $from)
    {
        $user = User::where('chat_id', $chatId)->first();
        if (! $this->vipOrPromptPurchase($chatId, $messageId, $user)) {
            return;
        }
        $user->setState('awaiting_symbol_for_signalhistory');

        $this->editMessage(
            $chatId,
            $messageId,
            "🔎 لطفا نام نماد مورد نظر را وارد کنید:",
            $this->keyboards->backButton()
        );

    }

    /** 📌 سیگنال‌های امروز */
    public function handleTodaySignals($chatId, $messageId, $from)
    {
        $user = User::where('chat_id', $chatId)->first();
        if (! $this->vipOrPromptPurchase($chatId, $messageId, $user)) {
            return;
        }
        $service = new TopSymbolsService();
       
        // $symbols = Cache::remember("today_signals_".$chatId, now()->addMinutes(1), function () use ($service,$user) {
        //     return $service->getTodaySignals($user);
        // });
        
         $symbols = $service->getTodaySignals($user);
        
        if (!empty($symbols)) {
            $pageData = $service->getPage($symbols, 1, 10, "today_signals");

            $this->editMessage(
                $chatId,
                $messageId,
                $pageData['text'],
                $pageData['keyboard']
            );
        } else {
            $this->editMessage(
                $chatId,
                $messageId,
                "📭 امروز هیچ سیگنالی صادر نشده است.",
                $this->keyboards->backButton()
            );
        }

        $user->clearState();
    }

    /** 📌 ویدیوهای آموزشی */
    public function handleTrainingVideos($chatId, $messageId, $from)
    {
        $user = User::where('chat_id', $chatId)->first();
        if (! $this->vipOrPromptPurchase($chatId, $messageId, $user)) {
            return;
        }



    $tutorial = Tutorial::firstOrFail();

    $text = "📚 بر روی دکمه زیر بزنید و وارد صفحه آموزش شوید";

  
        $url = route('tutorials.show', [
            'slug'  =>$tutorial->slug,
            'title' => $tutorial->title
        ]);
       
        // $text .= " <a href='{$url}'>ورود به صفحه آموزش</a>\n";
    
        $keyboard = [[
        
            [
                'text' => 'ورود به صفحه آموزش',
                'url'  => $url
            ]
        
        ,
            [
                'text' => "🔙 بازگشت",
        'callback_data' => 'back_to_menu'
            ]]];
            
        $this->editMessage($chatId, $messageId, $text, $keyboard);

        $user->clearState();
    }

    /** 📌 شناسه من */
    public function handleMyId($chatId, $messageId, $from)
    {
        // $user = User::where('chat_id', $chatId)->first();
        $user = User::where('chat_id', $chatId)->first();
        // $text = "\u{200F} 🆔 شناسه تلگرام شما:\n*{$chatId}*";
        $text = "\u{200F} 🆔 شناسه شما:\n*{$chatId}*";

       
        $this->editMessage($chatId, $messageId, $text, $this->keyboards->backButton());

        $user->clearState();
    }

    /** 📌 ارتباط با ما */
    public function handleContactUs($chatId, $messageId, $from)
    {
        $user = User::where('chat_id', $chatId)->first();
        $text = "☎️ برای ارتباط با پشتیبانی به این آیدی پیام بدهید:\n@signal365_support";
        $this->editMessage($chatId, $messageId, $text, $this->keyboards->backButton());

        $user->clearState();
    }

    /** 📌 تمدید سرویس */
    public function handleRenewService($chatId, $messageId, $from)
    {
        $telegramId = $chatId;
        // $startDate = Carbon::createFromFormat('Y-m-d H:i:s','2025-11-27 15:30:00');
        // $endDate = Carbon::createFromFormat('Y-m-d H:i:s','2025-11-27 16:30:00');
        // $isValid = User::where('chat_id',$chatId)->whereBetween('purchase_date',[$startDate,$endDate])->first();
        // \Log::info('isvalid: '.$isValid);
        // if(!$isValid){
        // $token = PaymentToken::generate($telegramId);
        
        // $paymentUrl = route('payment.start', ['token' => $token->token , 'type' => 'renew']);

        // $text = "🛒 جهت تمدید سرویس روی لینک زیر کلیک کنید:\n\n"
        //     . "<a href='{$paymentUrl}'>💳 پرداخت امن</a>";
        // $text.="\n\n⚠️ اگر vpn روشن است آن را خاموش کنید";    
        
        $price = intdiv(Setting::pluck('signal_price')->first(),10000);
      
        $text="جهت تمدید سرویس مراحل زیر را انجام دهید :";
        $text.="\n\n1️⃣ واریز مبلغ *$price هزار تومان* به کارت زیر\n";
        $card="بزن روش 👈 *6104337611152057* \n";
        $text.="\n{$card}";
        $text.="بنام *علی مصدق*";
        $text.="\n\n2️⃣ *رسید پرداخت* را به همراه *شناسه* (روی دکمه 'شناسه من' بزنید در صفحه اصلی ربات) به پشتیبانی ربات @signal365_support ارسال نمایید";
        
        // }else{
            
        //     $text = "❌ تعداد دفعات استفاده از این تخفیف برای شما به پایان رسیده ، لطفا بعد از پایان جشنواره تخفیفات مجدد برای خرید سرویس اقدام نمایید";
        //     // $text .="\n\n";
        //     // $text.="زمان پایان تخفیفات :  20:00 2025/11/28";
        // }

        $this->editMessage($chatId, $messageId,$text, $this->keyboards->backButton());
    }

    /** 📌 خرید سرویس */
    public function handlePurchaseService($chatId, $messageId, $from)
    {
        // $telegramId = $chatId;
        // $startDate = Carbon::createFromFormat('Y-m-d H:i:s','2025-11-27 15:30:00');
        // $endDate = Carbon::createFromFormat('Y-m-d H:i:s','2025-11-27 16:30:00');
        // $isValid = User::where('chat_id',$chatId)->whereBetween('purchase_date',[$startDate,$endDate])->first();
        // if(!$isValid){
    //     $token = PaymentToken::generate($telegramId);
    //     $paymentUrl = route('payment.start', ['token' => $token->token , 'type' => 'purchase']);

    //     $text = "🛒 برای خرید سرویس روی لینک زیر کلیک کنید:\n\n"
    //         . "<a href='{$paymentUrl}'>💳 پرداخت امن</a>";
    //   $text.="\n\n⚠️ اگر vpn روشن است آن را خاموش کنید";    
       
        $price = intdiv(Setting::pluck('signal_price')->first(),10000);
        // $text = "⚠️ درگاه پرداخت تا اطلاع ثانوی غیرفعال می باشد";
        $text="⚠️ سیگنال های این ربات فقط در حوزه بازار *سهام و بورس ایران* می باشد\n\n";
        $text.="⏰ مدت زمان اشتراک *سه ماه کاری* می باشد\n\n";
        $text.="جهت خرید سرویس مراحل زیر را انجام دهید :";
        $text.="\n\n1️⃣ واریز مبلغ *$price هزار تومان* به کارت زیر\n";
        $card="بزن روش 👈 *6104337611152057* \n";
        $text.="\n{$card}";
        $text.="بنام *علی مصدق*";
        $text.="\n\n2️⃣ *رسید پرداخت* را به همراه *شناسه* (روی دکمه 'شناسه من' بزنید در صفحه اصلی ربات) به پشتیبانی ربات @signal365_support ارسال نمایید";
        
        
        // }else{
            
        //     $text = "❌ تعداد دفعات استفاده از این تخفیف برای شما به پایان رسیده ، لطفا بعد از پایان جشنواره تخفیفات مجدد برای خرید سرویس اقدام نمایید";
        //     // $text .="\n\n";
        //     // $text.="زمان پایان تخفیفات :  20:00 2025/11/28";
        // }
        $this->editMessage($chatId, $messageId, $text, $this->keyboards->backButton());
    }

    /** 📌 دستور ناشناخته */
    public function handleUnknown($chatId, $messageId,$from)
    {
        $user = User::where('chat_id', $chatId)->first();
        $text = "❓ دستور ناشناخته";
        $this->editMessage($chatId, $messageId, $text, $this->keyboards->backButton());

        $user->clearState();
    }

    /** افزودن سهم به لیست هشدار */
    public function handleAlertsAdd($chatId, $messageId, $from)
    {
        $user = User::where('chat_id', $chatId)->first();

        if (! $this->vipOrPromptPurchase($chatId, $messageId, $user)) {
            return; // کاربر VIP نیست، پیام خرید نمایش داده شد
        }

        // 🔹 علامت‌گذاری کاربر برای حالت "در انتظار وارد کردن نماد"
        $user->setState('awaiting_alerts_add');

        // 🔹 پیام به کاربر
        $text = "📌 لطفاً نماد یا نمادهایی که می‌خواهید اضافه شود را طبق مثال وارد کنید:\n\nمثال: خودرو+خساپا+شبندر+شتران";
        $text .= "\n\n ⚠️ حداکثر ظرفیت لیست 100 نماد است";

        $keyboard = $this->keyboards->backToAlertList();

        $this->editMessage($chatId, $messageId, $text, $keyboard);
    }

    /** حذف سهم از لیست هشدار */

    public function handleAlertsRemove($chatId, $messageId, $from ,$all = null)
    {
        $user = User::where('chat_id', $chatId)->first();

        if (! $this->vipOrPromptPurchase($chatId, $messageId, $user)) {

            return; // کاربر VIP نیست، پیام خرید نمایش داده شد
        }
        
        if($all){
            $user->alerts()->delete();
            $this->handleAlertsList($chatId,$messageId,$from);
            return;
            
        }
        // 🔹 علامت‌گذاری کاربر برای حالت "در انتظار وارد کردن نماد"
        $user->setState('awaiting_alerts_remove');

        // 🔹 پیام به کاربر
        $text = "📌 لطفاً نماد یا نمادهایی که می‌خواهید حذف شوند را طبق مثال وارد کنید:\n\nمثال: خودرو+خساپا+شبندر+شتران";

        $keyboard = $this->keyboards->backToAlertList();

        $this->editMessage($chatId, $messageId, $text, $keyboard);
    }

/** مدیریت دکمه ادمین */

    public function handleAdminMenu($chatId, $messageId, $from)
    {

        // $user = User::where('chat_id', $chatId)->first();
        $this->handleBackToAdminMenu($chatId, $messageId, $from);

        // $user->clearState();
    }

/** افزودن کاربر ویژه توسط ادمین */

    public function handleAdminAddVip($chatId, $messageId, $from)
    {
        $text = "💎 برای افزودن کاربر VIP لطفاً Chat ID کاربر را وارد کنید:";
        $this->CommonAdmin($chatId, $messageId, $from, $text, 'awaiting_add_vip_chatid');
    }

/** حذف کاربر ویژه توسط ادمین */

    public function handleAdminRemoveVip($chatId, $messageId, $from)
    {
        $text = "🗑️ برای حذف کاربر VIP لطفاً Chat ID کاربر را وارد کنید:";
        $this->CommonAdmin($chatId, $messageId, $from, $text, 'awaiting_delete_vip_chatid');
    }

/** افزودن تعداد روز به تمام کاربران ویژه */

    public function handleAdminAddDaysAll($chatId, $messageId, $from)
    {
        $text = "📅 لطفاً تعداد روزی که باید به *همه کاربران VIP* اضافه شود را وارد کنید:";
        $this->CommonAdmin($chatId, $messageId, $from, $text, 'awaiting_days_all');
    }

/** افزودن تعداد روز به کاربر ویژه خاص */

    public function handleAdminAddDaysUser($chatId, $messageId, $from)
    {
        $text = "🆔 لطفاً Chat ID کاربر را وارد کنید:";
        $this->CommonAdmin($chatId, $messageId, $from, $text, 'awaiting_days_user_chatid');
    }

    public function handleBackToAdminMenu($chatId, $messageId, $from)
    {
        $user = User::where('chat_id', $chatId)->first();

        if ($user->role == "admin") {

            $text = "⚙️ منوی مدیریت:";
            $this->editMessage($chatId, $messageId, $text, $this->keyboards->adminMenu($user->chat_id));

            $user->clearState();
        }else{
            $this->handleBackToMenu($chatId, $messageId, $from);
        }
    }

    public function CommonAdmin($chatId, $messageId, $from, $text, $state)
    {
        $user = User::where('chat_id', $chatId)->first();

        if ($user->role == 'admin') {

            $user->setState($state);
            $this->editMessage($chatId, $messageId, $text, $this->keyboards->backToAdminMenu());
            // $this->telegram->sendMessage($chatId,$text);
        }else
        $this->handleBackToMenu($chatId, $messageId, $from);
    }
    
    public function handleAdminBroadcastVip($chatId, $messageId, $from)
    {
       
         $text = "📢 لطفاً پیام خود را ارسال کنید (متن، عکس، ویدیو، فایل...)\n\n❗ توجه: هرچی بفرستید به همه VIP ها ارسال خواهد شد.";
        
        $this->CommonAdmin($chatId, $messageId, $from, $text,"awaiting_broadcast_vip" );
        
    }
    public function handleAdminBroadcastAll($chatId, $messageId, $from)
    {
       
         $text = "📢 لطفاً پیام خود را ارسال کنید (متن، عکس، ویدیو، فایل...)\n\n❗ توجه: هرچی بفرستید به همه ارسال خواهد شد.";
        
        $this->CommonAdmin($chatId, $messageId, $from, $text,"awaiting_broadcast_all" );
        
    }
    public function handleAdminAddRemove($type,$chatId, $messageId, $from)
    {
        
        if($type === 'add'){
            
            $text = "👤 لطفاً آی‌دی عددی کاربری که می‌خواهید ادمین شود را ارسال کنید:";
            $state = "awaiting_admin_add";
        }else{
            
            $text = "❌ لطفاً آی‌دی عددی کاربری که می‌خواهید از لیست ادمین‌ها حذف شود را ارسال کنید:";
            $state = "awaiting_admin_remove";
        }
            $this->CommonAdmin($chatId, $messageId, $from, $text,$state );
            
    }
    
    public function handleUsersCount($chatId,$messageId,$from)
    {
        $users = User::count();
        $vipUsers = User::where('vip_until','>',now())->count();
        $text ="👥 تعداد کل کاربران : ".$users." نفر";
        $text.="\n\n🌟 ویژه : ".$vipUsers." نفر";
        $text.="\n\n";
        $url = route('users');
        $text.= "ℹ️ <a href='{$url}'>جزئیات بیشتر</a>";
        
        $keyboard = $this->keyboards->backButton();
        
        $this->editMessage($chatId, $messageId, $text, $keyboard);
        
        
    }
    public function handleChangeSignalDomain($chatId,$messageId,$from){
        
        
         $domain = Setting::pluck('signal_domain')->first();
        $state = "awaiting_change_signal_domain";
        $text = "➕ بازه جدید را وارد کنید : \n\n"."بازه سیگنال در حال حاضر ".$domain." است.";
        $this->CommonAdmin($chatId, $messageId, $from, $text, $state);
    }
    public function handleChangeSignalPrice($chatId,$messageId,$from){
        
        
         $price = Setting::pluck('signal_price')->first();
        $state = "awaiting_change_signal_price";
        $text = "➕ مبلغ جدید سرویس را به ریال وارد کنید : \n\n"."مبلغ در حال حاضر ".$price." ریال است.";
        $this->CommonAdmin($chatId, $messageId, $from, $text, $state);
    }
    public function handleChangeVipDays($chatId,$messageId,$from){
        
        
         $days = Setting::pluck('vip_days')->first();
        $state = "awaiting_change_vip_days";
        $text = "➕تعداد روز جدید اشتراک vip را وارد نمایید : \n\n"."تعداد روز در حال حاضر ".$days." است.";
        $this->CommonAdmin($chatId, $messageId, $from, $text, $state);
    }
}
