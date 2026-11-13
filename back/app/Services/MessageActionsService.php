<?php
namespace App\Services;

use App\Models\Symbol;
use App\Models\User;
use App\Models\UserAlert;
use App\Models\Setting;
use App\Services\KeyboardsService;
use App\Services\TopSymbolsService;
use App\Services\Telegram;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;


class MessageActionsService
{
    protected $telegram;

    public function __construct(Telegram $telegram)
    {
        $this->telegram = $telegram;

    }

    // 1️⃣ افزودن نماد به لیست هشدار

   public function AwaitingAlertsAdd($user, $text, $chatId)
{
    $names = array_map('trim', explode('+', $text));

    // نمادهای معتبر در جدول Symbol
    $foundSymbols = Symbol::whereIn('name', $names)
        ->pluck('code', 'name')
        ->toArray();

    $validNames   = array_keys($foundSymbols);
    $invalidNames = array_diff($names, $validNames);
    $duplicateNames = [];
    
    
    // شمارش تعداد نمادهای فعلی کاربر
    $currentCount = UserAlert::where('user_chat_id', $user->chat_id)->count();

    // آرایه برای ثبت نتیجه عملیات
    $addedSymbols = [];
    $skippedSymbols = [];
    
    foreach ($foundSymbols as $name => $code) {
        
        $exist = UserAlert::where('symbol_code',$code)->where('user_chat_id',$user->chat_id)->exists();
        
        if($exist){
            $duplicateNames[] = $name;
            continue;
        }
        
        if ($currentCount >= 100) {
            // اگر بیش از 100 نماد شد، اضافه نکن و در skipped ذخیره کن
            $skippedSymbols[] = $name;
            continue;
        }

        // اگر هنوز جا داریم، نماد را ثبت کن
        $alert = UserAlert::updateOrCreate([
            'user_chat_id' => $user->chat_id,
            'symbol_code'  => $code,
        ]);

        // فقط اگر تازه ساخته شده، شمارنده را افزایش بده
        // if ($alert->wasRecentlyCreated) {
            $addedSymbols[] = $name;
            $currentCount++;
        // }
    }

    // ساخت پیام خروجی
    $msg = '';

    if (!empty($addedSymbols)) {
        $msg .= "✅ نماد(ها) با موفقیت اضافه شدند:\n" .
            implode('، ', $addedSymbols) . "\n\n";
    }

    if (!empty($invalidNames)) {
        $msg .= "❌ نماد نامعتبر است یا فرمت نادرست است:\n" .
            implode('، ', $invalidNames) . "\n\n";
    }
    
    if (!empty($duplicateNames)) {
        $msg .= "❌ نماد(ها) تکراری : \n" .
            implode('، ', $duplicateNames) . "\n\n";
    }

    if (!empty($skippedSymbols)) {
        $msg .= "⚠️ نماد(ها) زیر به دلیل پر بودن سقف ۱۰۰ نماد افزوده نشدند:\n" .
            implode('، ', $skippedSymbols) . "\n\n";
    }

    // اگر هیچ نمادی اضافه یا پیدا نشد
    if (empty($addedSymbols) && empty($invalidNames) && empty($skippedSymbols) && empty($duplicateNames)) {
        $msg = "⚠️ هیچ نمادی برای افزودن یافت نشد.";
    }

    // ارسال پیام به کاربر
    $this->sendMessageWithBackToAlert($chatId, trim($msg));

    // پاک کردن وضعیت کاربر
    $user->clearState();
}


    // 2️⃣ حذف نماد از لیست هشدار
     public function AwaitingAlertsRemove($user, $text, $chatId)
{
    // جدا کردن نمادها
    $names = array_map('trim', explode('+', $text));

    // نمادهای معتبر داخل جدول
    $foundSymbols = Symbol::whereIn('name', $names)->pluck('code', 'name')->toArray();

    // نام‌هایی که واقعاً وجود دارن
    $validNames = array_keys($foundSymbols);

    // نام‌هایی که اصلاً در جدول نمادها نیستن
    $invalidNames = array_diff($names, $validNames);

    // بررسی اینکه آیا کاربر این نمادهای معتبر رو در لیست هشدار داره
    $userSymbols = UserAlert::where('user_chat_id', $user->chat_id)
        ->whereIn('symbol_code', $foundSymbols)
        ->pluck('symbol_code')
        ->toArray();

    // نام‌های واقعی‌ای که حذف شدن
    $removedNames = array_keys(array_filter($foundSymbols, function($code) use ($userSymbols){ return in_array($code, $userSymbols);}));

    // حذف از جدول
    if (!empty($userSymbols)) {
        UserAlert::where('user_chat_id', $user->chat_id)
            ->whereIn('symbol_code', $userSymbols)
            ->delete();
    }

    // ساخت پیام خروجی
    $msg = '';
    if (!empty($removedNames)) {
        $msg .= "🗑️ این نماد(ها) با موفقیت حذف شدند:\n" . implode('، ', $removedNames) . "\n\n";
    }
    if (!empty($invalidNames)) {
        $msg .= "❌ نمادهای نامعتبر :\n" . implode('، ', $invalidNames) . "\n\n";
    }
    if (empty($removedNames) && empty($invalidNames)) {
        $msg .= "ℹ️ هیچ نمادی برای حذف پیدا نشد.";
    }

    $this->sendMessageWithBackToAlert($chatId, trim($msg));
    $user->clearState();
}


    // 3️⃣ افزودن روز به تمام کاربران VIP (فقط کاربرانی که vip_until آینده دارند)
    public function AwaitingDaysAll($user, $text, $chatId)
    {
        $days = (int) $text;
        $vipUsers = User::where('is_vip',true)->where('vip_until','>',now())->get();
       if($days > 0){
        $vipUsers->chunk(50)->each(function($usersChunk) use ($days){
            
            foreach($usersChunk as $user){
                $user->vip_until = $user->vip_until->addDays($days);
                $user->save();
              
                $this->sendMessageWithBack($user->chat_id, "🎉 ادمین برای شما {$days} روز VIP اضافه کرد!");
            }
        });
        
        $this->sendMessageWithBack($chatId, "✅ {$days} روز به تمام کاربران VIP که سرویسشان هنوز فعال است اضافه شد.");
 
       }
        else {
            $this->sendMessageWithBack($chatId, "❌ لطفاً یک عدد معتبر وارد کنید.");
            return;
        }

        $user->clearState();
        return;

    }

    // 4️⃣ دریافت Chat ID کاربر برای افزودن روز
    public function AwaitingDaysUserChatid($user, $text, $chatId)
    {
        $targetChatId = trim($text);

        $user->setState('awaiting_days_user_days', ['chat_id' => $targetChatId]);

        $this->sendMessageWithBack($chatId, "📅 لطفاً تعداد روز را وارد کنید:");
        return;

    }

    // 5️⃣ دریافت تعداد روز برای کاربر خاص
    public function get_vip_days(){
        return Setting::pluck('vip_days')->first();
    }
    public function AwaitingDaysUserDays($user, $text, $chatId)
    {
        $days         = (int) $text;
        $targetChatId = $user->getMeta($chatId);

        if ($targetChatId && $days > 0) {
            $targetUser = User::where('chat_id', $targetChatId)->first();

            if ($targetUser) {
                $targetUser->vip_until = $targetUser->isVip()
                    ? $targetUser->vip_until->addDays($days)
                    : Carbon::now()->addDays($days);
                $targetUser->notified_expiring    = false;
                $targetUser->notified_expired    = false;
                
                if($days === $this->get_vip_days() && $targetUser->isVip()){
                    
                $targetUser->purchase_count += 1;
                $targetUser->purchase_date = now();
                }
                
                $targetUser->save();
                
                $this->sendMessageWithBack($chatId, "✅ {$days} روز به کاربر {$targetChatId} اضافه شد.");
                $this->sendMessageWithBack($targetChatId, "🎉 ادمین برای شما {$days} روز VIP اضافه کرد!");
            } else {
                $this->sendMessageWithBack($chatId, "❌ کاربری با این Chat ID پیدا نشد.");
            }
        } else {
            $this->sendMessageWithBack($chatId, "❌ ورودی نامعتبر بود.");
        }

        $user->clearState();
        return;

    }

    // 6️⃣ افزودن کاربر VIP دستی
    public function AwaitingAddVipChatid($user, $text, $chatId)
    {
        $targetChatId = trim($text);
        $targetUser   = User::where('chat_id', $targetChatId)->first();
        
        if ($targetUser) {
            if($targetUser->isVip()){
                $targetUser->purchase_date    = now();
                $targetUser->purchase_count  += 1;
                // $targetUser->token = Str::random(30);
                $targetUser->vip_until = $targetUser->vip_until->addDays((int) $this->get_vip_days());
                $targetUser->save();
                
            $this->sendMessageWithBack($chatId, "✅ کاربر {$targetChatId} با موفقیت تمدید شد.", true);
            $this->sendMessageWithBack($targetChatId, "🎉 ادمین سرویس شما را تمدید کرد!");
            
            }else{
            $targetUser->is_vip    = true;
            $targetUser->notified_expiring    = false;
            $targetUser->notified_expired    = false;
            $targetUser->vip_until = Carbon::now()->addDays((int) $this->get_vip_days()); // پیش‌فرض 30 روز
            $targetUser->purchase_date    = now();
            $targetUser->purchase_count  += 1;
            // $targetUser->token = Str::random(30);
            $targetUser->save();
            
            $this->sendMessageWithBack($chatId, "✅ کاربر {$targetChatId} با موفقیت VIP شد.", true);
            $this->sendMessageWithBack($targetChatId, "🎉 ادمین شما را VIP کرد!");
            
            $tabrikMsg = "
           🎉 مشترک گرامی ضمن تشکر بابت خرید اشتراک به منظور اینکه بتونی بهترین نتیجه رو با ربات بگیری به نکات زیر حتما توجه کن و هیچ وقت خلاف این نکات عمل نکن :
           
▪️ 
▪️ فقط زمانی که بهت سیگنال میدم خرید و فروش کن

▪️وقتی سهامت رو سیگنال فروش کردم باید بفروشی حتی اگر تو زیان بودی

▪️محدوده سیگنال هایی که قراره بهت بدم : 100 سهم برتر + لیست هشدار

▪️توصیه من اینه فقط از بین 100 سهم برتر خرید کن

▪️هر سهمی که در آینده بهت سیگنال میدم اگر خرید کردی باید به لیست هشدار اضافه کنی ، اگر اضافه نکنی زمانی که اون سهم سیگنال فروش میشه بهت خبر نمیدم چون من موقع سیگنال فروش فقط لیست هشدارت رو چک میکنم

▪️سهام بازار پایه برای من تعریف نشده و نمیتونی به لیست هشدار اضافه کنی، از بین صندوق ها فقط این گزینه ها رو پشتیبانی میکنم : #عیار #اهرم #موج #شتاب #جهش #بیدار #توان #نارنج اهرم #دوایکس #دارایکم #پالایش #صنم #تمشک #کلید #ارزش مسکن#اطلس 

▪️اگر لیست هشدار رو خالی بزاری من فقط از بین 100 سهم برتر بهت سیگنال ( خرید و فروش) میدم

▪️اگر تو یک روز بصورت همزمان چندتا سیگنال خرید بهت دادم اونی رو بخر که سابقه 10 سیگنال آخرش بهتره، یا چندتا رو همزمان بخر و سرمایتو بطور مساوی بین سیگنال ها تقسیم کن، همیشه بین 10 تا 20 سهم توی پرتفوت باشه

▪️سیگنال هایی که من میدم معمولا قبل از تشکیل صف های خرید و فروش هستند ولی به ناچار برخی ها هنگام سیگنال تو صف خرید یا فروش قفل هستند  اگر سهمی سیگنال خرید شد و اون سهم تو صف خرید قفل بود همون لحظه که سیگنال میشه برو تو صف خرید بشین تا آخر وقت، اگر خرید نشد روز بعد سرخطی بزن، اگر بازم خرید نشد دیگه بیخیالش شو، هر سیگنال فقط 2 روز فرصت خرید داره، زمان فروش هم اگر تو صف فروش قفل بود باید بری تو صف فروش بشینی و هر روز سرخطی بزنی تا بتونی هرچه زودتر خارج بشی از سهم

▪️هنگامی که بهت سیگنال میدم باید همون لحظه تصمیمت رو بگیری و سریع اقدام کنی، گاهی اوقات حتی چند دقیقه تاخیر هم باعث از دست رفتن فرصت خرید یا فروش میشه

▪️برای من خرید پله ای معنی نداره و هر سهمی که بهت سیگنال میدم همون لحظه باید تصمیم بگیری که چقدر سرمایه وارد کنی، سهمی که زمان سیگنالش گذشته و مربوط به روزهای قبل هست رو به هیچ وجه نباید الان بری بخری 

▪️پیامی که شب ها تحت عنوان ' نزدیک به سیگنال خرید یا فروش ' برات میفرستم فقط یک هشدار هست که بدونی که روز بعد قراره چه سهامی رو سیگنال بدم و معنی دیگری نداره، اگر مشخص شد که سهم شما نزدیک به سیگنال خرید یا فروش هست هیچ وقت زودتر از من کاری نکن، اجازه بده اول سهم شما رو در تایم بازار سیگنال بدم بعد اقدام کن
            ";
            $this->telegram->sendMessage($targetChatId,$tabrikMsg,[]);
            
            }

            
        } else {
            $this->sendMessageWithBack($chatId, "❌ کاربری با این Chat ID پیدا نشد.");
        }

        $user->clearState();
        return;

    }

    // 7️⃣ حذف کاربر VIP
    public function AwaitingDeleteVipChatid($user, $text, $chatId)
    {
        $targetChatId = trim($text);
        $targetUser   = User::where('chat_id', $targetChatId)->first();

        if ($targetUser) {
            $targetUser->vip_until = Carbon::now()->subDays(1);
            // $targetUser->token = null;
            $targetUser->save();

            $this->sendMessageWithBack($chatId, "🗑️ کاربر {$targetChatId} از VIP حذف شد.");
            $this->sendMessageWithBack($targetChatId, "⚠️ دسترسی VIP شما توسط ادمین لغو شد.");
        } else {
            $this->sendMessageWithBack($chatId, "❌ کاربری با این Chat ID پیدا نشد.");
        }

        $user->clearState();
        return;

    }

/**  سابقه سیگنال های سهم خاص */
    public function AwaitingSymbolForSignalHistory($user, $text, $chatId)
    {
        $symbolName = trim($text);
        
        

        $symbol = Symbol::where('name', $symbolName)->first();

        if (! $symbol) {
            $this->sendMessageWithBack($chatId, "❌ نماد '$symbolName' پیدا نشد. دوباره امتحان کنید.");
            return;
        }
        $service = new TopSymbolsService();
        $returns = Cache::remember("signals_history*{$symbol->code}", now()->addMinutes(5), function () use ($service, $symbol) {
            return $service->get10SignalsHistory($symbol->code);
        });
        
        // $returns = $service->get10SignalsHistory($symbol->code);

        if (empty($returns)) {
            $this->sendMessageWithBack($chatId, " \u{200E} برای نماد #{$symbol->name} در حال حاضر سابقه ای وجود ندارد ℹ️ ");
            return;
        }

        $returns = $service->getPage($returns, 1, 4, 'signals_history',$symbol->code);

        $profitCount = 0;
        $lossCount   = 0;
    
      $this->telegram->sendMessageWithInlineKeyboard(
            $chatId,
            $returns['text'],
            $returns['keyboard']
        );

        $user->clearState();
        return;

    }
    public function AwaitingBroadcastVip($user,$chatId,$message)
    {

        // $vipUser = User::where('vip_until','>',now())->pluck('chat_id');
        $keyboard = new KeyboardsService();    
        User::where('vip_until','>=',now())->chunk(100,function ($usersChunk) use ($message,$keyboard){
            
            foreach($usersChunk as $vipChatId){
                if(isset($message['caption']))
                   $caption = $message['caption'];
                   else $caption = '';
                try{
                   if (isset($message['text'])) {
                $this->telegram->sendMessage(
                    $vipChatId->chat_id,
                    $message['text']
                );
            } elseif (isset($message['photo'])) {
                $this->telegram->sendPhoto(
                    $vipChatId->chat_id,
                    $message['photo'][0]['file_id'],
                    $caption
                );
            } elseif (isset($message['video'])) {
                $this->telegram->sendVideo(
                    $vipChatId->chat_id,
                    $message['video']['file_id'],
                    $caption
                );
            } elseif (isset($message['voice'])) {
                $this->telegram->sendVoice(
                    $vipChatId->chat_id,
                    $message['voice']['file_id'],
                    $caption
                );
            } elseif (isset($message['audio'])) {
                $this->telegram->sendAudio(
                    $vipChatId->chat_id,
                    $message['audio']['file_id'],
                    $caption
                );
            } elseif (isset($message['document'])) {
                $this->telegram->sendDocument(
                    $vipChatId->chat_id,
                    $message['document']['file_id'],
                    $caption
                );
            }
        } catch (\Exception $e) {
            \Log::error("خطا در ارسال به کاربر $vipChatId: ".$e->getMessage());
        }
    }

    // پیام تایید به ادمین
     sleep(1);
                
            });
     
     $this->telegram->sendMessageWithInlineKeyboard(
        $chatId,
        "✅ پیام شما با موفقیت به همه VIP ها ارسال شد.",
        $keyboard->backToAdminMenu()
    );
    
    $user->clearState();
    return;
        
    }
    public function AwaitingBroadcastAll($user,$chatId,$message)
    {

        // $vipUser = User::pluck('chat_id');
        $keyboard = new KeyboardsService();    
        User::chunk(100 , function ($usersChunk) use ($message,$keyboard){
            
            foreach($usersChunk as $vipChatId){
                if(isset($message['caption']))
                   $caption = $message['caption'];
                   else $caption = '';
                try{
                   if (isset($message['text'])) {
                $this->telegram->sendMessage(
                    $vipChatId->chat_id,
                    $message['text']
                );
            } elseif (isset($message['photo'])) {
                $this->telegram->sendPhoto(
                    $vipChatId->chat_id,
                    $message['photo'][0]['file_id'],
                    $caption
                );
            } elseif (isset($message['video'])) {
                $this->telegram->sendVideo(
                    $vipChatId->chat_id,
                    $message['video']['file_id'],
                    $caption
                );
            } elseif (isset($message['voice'])) {
                $this->telegram->sendVoice(
                    $vipChatId->chat_id,
                    $message['voice']['file_id'],
                    $caption
                );
            } elseif (isset($message['audio'])) {
                $this->telegram->sendAudio(
                    $vipChatId->chat_id,
                    $message['audio']['file_id'],
                    $caption
                );
            } elseif (isset($message['document'])) {
                $this->telegram->sendDocument(
                    $vipChatId->chat_id,
                    $message['document']['file_id'],
                    $caption
                );
            }
        } catch (\Exception $e) {
            \Log::error("خطا در ارسال به کاربر $vipChatId: ".$e->getMessage());
        }
    }

    // پیام تایید به ادمین
     sleep(1);
                
            });
     
     $this->telegram->sendMessage(
        $chatId,
        "✅ پیام شما با موفقیت به همه VIP ها ارسال شد."
    );
    
    $user->clearState();
    return;
        
    }
    
    public function AwaitingAddRemoveAdmin($type,$user,$text,$chatId)
    {
        $checkUser = User::where('chat_id',trim($text))->first();
        $keyboard = new KeyboardsService();
        
        if($checkUser){
        $checkUser->role = $type === 'add' ? 'admin' : 'user';
        $checkUser->update();
        }
        else{
            $this->telegram->sendMessageWithInlineKeyboard(
                $chatId,
                "❌ این چت آی دی نامعتبر است ، لطفا Chat ID معتبر وارد نمایید",
               $keyboard->backToAdminMenu()
                );
                
                return;
        }
        $textMessage = $type === 'add' ?
         "✅ کاربر {$text} با موفقیت ادمین شد"
        :
             "❌ کاربر {$text} به کاربر عادی تبدیل شد"
            ;
            
            $textMessage2 = $type === 'add' ?
         "✅  مدیریت شما را ادمین کرد" :
             "❌  شما دیگر ادمین نیستید"
            ;
            
            
         $this->telegram->sendMessage(
                $chatId,
                $textMessage,
                $keyboard->backToAdminMenu()
                );
                
        $this->telegram->sendMessageWithInlineKeyboard(
                trim($text),
                $textMessage2,
                $keyboard->backButton()
                );        
        
        
        $user->clearState();
        return;
        
    }
    
    public function AwaitingChangeSignalDomain($user, $text, $chatId){
        
        try{
         $setting = Setting::firstOrFail();
         $setting->signal_domain = $text;
         $setting->save();
              $t ='✅ بازه با موفقیت آپدیت شد' ;
        $this->sendMessageWithBack($chatId, $t, 1);
        
        }catch(\Exception $e){
              $t ='❌ عملیات ناموفق!' ;
             $this->sendMessageWithBack($chatId, $t, 1);
        } 
        
      
        
    }
    public function AwaitingChangeSignalPrice($user, $text, $chatId){
        
        try{
        
         $setting = Setting::firstOrFail();
         $setting->signal_price = $text;
         $setting->save();
              $t ='✅ مبلغ جدید با موفقیت آپدیت شد' ;
        $this->sendMessageWithBack($chatId, $t, 1);
        
        }catch(\Exception $e){
              $t ='❌ عملیات ناموفق!' ;
             $this->sendMessageWithBack($chatId, $t, 1);
        } 
        
      
        
    }
    public function AwaitingChangeVipDays($user, $text, $chatId){
        
        try{
        
         $setting = Setting::firstOrFail();
         $setting->vip_days = $text;
         $setting->save();
              $t ='✅  زمان جدید اشتراک با موفقیت آپدیت شد' ;
        $this->sendMessageWithBack($chatId, $t, 1);
        
        }catch(\Exception $e){
              $t ='❌ عملیات ناموفق!' ;
             $this->sendMessageWithBack($chatId, $t, 1);
        } 
        
      
        
    }
    private function sendMessageWithBack($chatId, $text, $admin = null)
    {
        $keyboard = new KeyboardsService();
        $this->telegram->sendMessageWithInlineKeyboard(
            $chatId,
            $text,
            $admin ? $keyboard->backToAdminMenu() : $keyboard->backButton()
        );
    }
    private function sendMessageWithBackToAlert($chatId, $text)
    {
        $keyboard = new KeyboardsService();
        $this->telegram->sendMessageWithInlineKeyboard(
            $chatId,
            $text,
            $keyboard->backToAlertList()
        );
    }

}
