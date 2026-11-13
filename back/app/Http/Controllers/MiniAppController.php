<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Plan;
use App\Models\UserAlert;
use App\Models\Symbol;
use App\Models\BroadcastJob;
use App\Models\Setting;
use App\Models\Signal;
use App\Services\BaleAuthService;
use App\Services\Telegram;
use App\Services\TopSymbolsService;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Illuminate\Support\Str;



class MiniAppController extends Controller
{
    protected $topService;
    protected $baleService;
    protected $telegram;
    public function __construct(TopSymbolsService $service,BaleAuthService $baleService,Telegram $telegram)
    {
      $this->topService = $service;
      $this->baleService = $baleService;
      $this->telegram = $telegram;
    }
    
    public function auth(Request $request){
        //  \Log::info('entering auth');
        $initData = $request->header('Authorization');
        //  \Log::info('authorization in auth : '.$initData);
        // $initData = $request->input('initData');
        // $token = $request->input('token');
       
        if (!$initData || $initData == "") {
            // \Log::info('user_id: '."access denied");
          return response()->json(['error' => 'دسترسی غیرمجاز!'],401);
        }
       
    //   if($initData!=""){
           
       $user = $this->baleService->validateInitData($initData);
           
    //   } 
    //   else
    //   $user = User::where('api_token',$token)->first();
     
      
         if(!$user){
            return response()->json([
                'success' => false,
                'error' => 'invalid_user'
            ], 401);
            //  \Log::info('user_id: '."invalid_user");
        }
        
        $chatId = $user['id'];
        // \Log::info('user: '.json_encode($user));
        $firstName = $user['first_name'] ?? '';
        $userName = $user['username'] ?? '';
       
        // $token = Str::random(60);
        $sendToken = null;
        
        $userr = User::updateOrCreate(['chat_id' => $chatId],
        [
            'name' => $firstName,
            'username' => $userName
            ]
        );
        // if(!$userr->api_token){
            // $userr->api_token = $token;
            // $userr->save();
            // $sendToken = $token;
            //  return response()->json([
            //     'token' => $token,
            //     'data' => [
            //         'chat_id' => $userr->chat_id,
            //         'is_vip' => $userr->isVip(),
            //         'vip' => $userr->is_vip,
            //         'role' => $userr->role,
            //         'remaining_day' => $userr->remaining_days
            //         ]
            // ]);
        // }
        
            
        // if(!$userr->api_token){
        // $userr->api_token = $tokenn;
        // $userr->save();
        // }
        
            return response()->json([
                // 'token' => $token,
                'data' => [
                    'chat_id' => $userr->chat_id,
                    'is_vip' => $userr->isVip(),
                    'vip' => $userr->is_vip,
                    'role' => $userr->role,
                    'remaining_day' => $userr->remaining_days,
                    'photo_url' => $user['photo_url']
                    ]
            ]);
     
    }
    static function user(Request $request){
        return ;
    }
    public function top100(Request $request){
    //   Cache::forget('top100_symbols');
       $user = $request->input('user');
       
    //   if(Cache::has('top100_symbols'))
    //   $top100 = Cache::get('top100_symbols');
    //   else
       $top100 = $this->topService->getTop100();
       
       if(!$user->isVip()){
       $top100 = $top100->map(function($item){
        unset($item['symbol_code'],$item['symbol_name']);
        return $item;
       });
       
       }
       return response()->json(['data' =>$top100]);
        
    }
    
    public function alarms(Request $request){
       
       $user = $request->input('user');
       
    //   $chatId = $request->input('chat_id') ;
        
       $alerts = UserAlert::with('symbol')->where('user_chat_id',$user->chat_id)->get();
       
       if($alerts->isEmpty())
       return response()->json(['data' => []]);
       
       $alerts = $alerts->map(function($alert){
           return [
               'code' => $alert->symbol->code ,
               'name' => $alert->symbol->name
               ];
       });
       
       return response()->json(['data' => $alerts]);
    }
    public function addAlarms(Request $request){
           $symbols = $request->input('list');
           $user = $request->input('user');
           
           if(!$user->isVip())
            return response()->json(['vip' => false]);
        //   $chatId = $request->input('chat_id');
       try{
           
           foreach($symbols as $index => $symbol){
              $count = UserAlert::where('user_chat_id',$user->chat_id)->count() ?? 0;
              if($count < 100){
               UserAlert::updateOrCreate([
                   'user_chat_id' => $user->chat_id,
                   'symbol_code' => $symbol['code'],
                   ]);
              }else{
                 
                  return response()->json(['reach_max' => array_slice($symbols,$index)]); 
              }
           };
       return response()->json(['data' => 'update successfull']);
       
       }catch(\Exception $e){
           
       return response()->json(['error' => 'update failed']);
       }
    }
    public function removeAlarms(Request $request){
           $list = $request->input('list');
           $user = $request->input('user');
       try{
          
          UserAlert::where('user_chat_id',$user->chat_id)->whereIn('symbol_code',$list)->delete();
           
       return response()->json(['data' => 'update successfull']);
       }catch(\Exception $e){
           
       return response()->json(['error' => 'update failed']);
       }
    }
  
    public function searchSymbols(Request $request){
        $search = $request->input('search');
        $symbols = Symbol::where('name', 'LIKE', "%$search%")->get();
        $symbols = $symbols->map(function($symbol){
           return [
               'code' => $symbol->code ,
               'name' => $symbol->name
               ];
       });
       return response()->json(['data' => $symbols]);
    
    }
    public function searchSymbolsCheck(Request $request,$symbol_code){
        
        $user = $request->input('user');
        
        $symbols = UserAlert::where('user_chat_id',$user->chat_id)->where('symbol_code',$symbol_code)->exists();
        
       return response()->json(['valid' => $symbols]);
    
    }
    public function todaySignals(Request $request)
    {
      $user = $request->input('user');
      
    $signals = Signal::whereDate('created_at', now()->toDateString())
    ->where(function($query){
        $query->where(function($q){
        // $q->where('type','buy')->where('valid',true);
        $q->where('type','buy');
        })->orWhere(function($query){
        $query->where(function($q){
        $q->where('type','sell');});
        });})
    ->orderBy('created_at','asc')->get();
    
    if ($signals->isEmpty()) {
        return response()->json(['data' => '']);
    }
    if(Cache::has('top100_symbols')) {
    $top100 = Cache::get('top100_symbols');
    }else
    $top100 = $this->topService->getTop100();
    
    // if(!$user->isVip()){
    
    // return response()->json(['data' => $signals->makeHidden('symbol_code')]);
        
    // }
    
    $alerts = UserAlert::where('user_chat_id', $user->chat_id)->get();
    $top100Map = $top100->keyBy('symbol_code');
    $alertsMap = $alerts->keyBy('symbol_code');
    
    $signals = $signals->map(function ($signal) use ($top100Map, $alertsMap,$user) {
        if(!$user->isVip()){
            if (isset($top100Map[$signal->symbol_code])) {
            $signal->source = 'سهام برتر';
            // unset($signal->symbol_code);
            }
        }else{
            
        $symbol = $signal->symbol_code;
        $signal->name = $signal->symbol->name;
        $signal->time1 = $signal->created_at->timezone('asia/tehran')->format('H:i');
        if (isset($top100Map[$symbol])) {
            $signal->source = 'سهام برتر';
        } elseif (isset($alertsMap[$symbol])) {
            $signal->source = 'لیست هشدار';
        }
        }
        return $signal;
       
    })->filter(fn($e) => $e->source);
    
    return response()->json(['data' => $user->isVip() ? $signals->values() : $signals->pluck('type')->map(fn($item) => ['type' => $item]),'date' => toJalaliDateOnly(now()->toDateString())]);

    
}

    public function stockHistory(Request $request){
        $search = $request->input('search');
        $user = $request->input('user');
        $chatId = $user->chat_id;
        $tr               = 1;
        // $ss = Signal::each(function($s){
        //     $s->date = toJalaliDateOnly($s->date);
        //     $s->save();
        // });
       
        if(!$user->isVip()){
            // $user = User::where('chat_id',$chatId)->first();
            if($user->visited_symbol_count < 10){
                $user->visited_symbol_count+=1;
                $user->save();
            }
            else{

                 return response()->json(['max_visited' => 'reached']);
            }
        }
        
        $signals = Signal::where('symbol_code',$search)->orderByDesc('id')->get();
       
        $result = [];
            $i=0;
        foreach($signals as $index => $signal){
            // if($signal->type == 'buy' && $signal->valid){
            if($signal->type == 'buy'){
               
                if($index == 0){
                    $symbol = Symbol::where('code',$signal->symbol_code)->first();
                     $return = round((($symbol->close - $signal->close) / $signal->close) * 100,2);
                $buy_date=$signal->date;
                //   $buy_date = toJalaliDateOnly($signal->created_at->toDateString());  
                 $tr *=1+round($return/100,2);
                }
                
                else{
                $prev = $signals[$index - 1];
                $return = round((($prev->close - $signal->close)/$signal->close) * 100,2);
                $tr *=1+round($return/100,2); 
               $buy_date = $signal->date;
               $sell_date = $prev->date;
                // $buy_date = toJalaliDateOnly($signal->created_at->toDateString());
                // $sell_date = toJalaliDateOnly($prev->created_at->toDateString());
                }
                     
                 $result []=[
                'return' => $return,
                'buy_date' => $buy_date,
                'sell_date' => $sell_date ?? null
                ];
                if($i == 4){
                    break;
                }
                $i++;
            }
           
        }
            return response()->json(['data' => ['history' => $result,'totalReturn' => round(($tr -1) * 100 ,2)]]);

    }

    
    public function usersCount(Request $request)
    {
       $users = User::count();
       $vips = User::where('vip_until','>=',now())->count();
        return response()->json(['data' => ['all' => $users,'vip' => $vips]]);
        
    }
    public function addVips(Request $request)
    {
 
       try{
           $chatId = $request->input('chat_id');
           if($chatId == '')
           return response()->json(['success' => false]);
           
           $plan = $request->input('plan');
           $period = Plan::where('type',$plan)->pluck('period')->first();
           
           $user = User::where('chat_id',$chatId)->first();
           
           if(!$user)
            return response()->json(['success' => false]);
                    //  return response()->json(['success' => $user]);
           if($user->isVip()){
                    //  return response()->json(['success' => $period*2]);
    
           $user->vip_until = $user->vip_until->addDays((int)$period);
           $text="🎉 سرویس شما با موفقیت تمدید شد";
           $text.="\n\n به صفحه اپلیکیشن ربات بازگردید و 10 ثانیه صبر کنید اگر تغییرات اعمال نشد صفحه اپلیکیشن رو یکبار ببندید و دوباره وارد شوید";
            $this->telegram->sendMessage($chatId,$text);
           }
           else{
               
        //   return response()->json(['success' => $period]);
            $user->vip_until = now()->addDays((int)$period);
          $text1="🎉 اشتراک VIP شما با موفقیت فعال شد.";
          
          
          $text2="
          🎉 مشترک گرامی ضمن تشکر بابت خرید اشتراک به منظور اینکه بتونی بهترین نتیجه رو با ربات بگیری به نکات زیر حتما توجه کن و هیچ وقت خلاف این نکات عمل نکن :

▪️ سیگنال ها رو در تایم بازار برات ارسال میکنم، سیگنال های خرید از ساعت 10:00 و سیگنال های فروش از ساعت 11:00 شروع میشن ، سیگنال دهی صندوق های #عیار و #سیلور راس ساعت 13:00

▪️ فقط زمانی که بهت سیگنال میدم خرید و فروش کن

▪️وقتی سهامت رو سیگنال فروش کردم باید بفروشی حتی اگر تو زیان بودی

▪️محدوده سیگنال هایی که قراره بهت بدم : سهام برتر + لیست هشدار

▪️توصیه من اینه فقط از بین سهام برتر خرید کن

▪️هر سهمی که الان داری یا در آینده بهت سیگنال میدم اگر خرید کردی باید به لیست هشدار اضافه کنی ، اگر اضافه نکنی زمانی که اون سهم سیگنال فروش میشه بهت خبر نمیدم چون من موقع سیگنال فروش فقط لیست هشدارت رو چک میکنم

▪️سهام بازار پایه برای من تعریف نشده و نمیتونی به لیست هشدار اضافه کنی، از بین صندوق ها فقط این گزینه ها رو پشتیبانی میکنم : #عیار #اهرم #موج #شتاب #جهش #بیدار #توان #نارنج اهرم #دوایکس #دارایکم #پالایش #صنم #تمشک #کلید #ارزش مسکن 

▪️اگر لیست هشدار رو خالی بزاری من فقط از بین سهام برتر بهت سیگنال ( خرید و فروش) میدم

▪️اگر تو یک روز بصورت همزمان چندتا سیگنال خرید بهت دادم اونی رو بخر که سابقه 5 سیگنال آخرش بهتره، یا چندتا رو همزمان بخر و سرمایتو بطور مساوی بین سیگنال ها تقسیم کن، همیشه بین 10 تا 20 سهم توی پرتفوت باشه

▪️سیگنال هایی که من میدم معمولا قبل از تشکیل صف های خرید و فروش هستند ولی به ناچار برخی ها هنگام سیگنال تو صف خرید یا فروش قفل هستند  اگر سهمی سیگنال خرید شد و اون سهم تو صف خرید قفل بود همون لحظه که سیگنال میشه برو تو صف خرید بشین تا آخر وقت، اگر خرید نشد روز بعد سرخطی بزن، اگر بازم خرید نشد دیگه بیخیالش شو، هر سیگنال فقط 2 روز فرصت خرید داره، زمان فروش هم اگر تو صف فروش قفل بود باید بری تو صف فروش بشینی و هر روز سرخطی بزنی تا بتونی هرچه زودتر خارج بشی از سهم

▪️هنگامی که بهت سیگنال میدم باید همون لحظه تصمیمت رو بگیری و سریع اقدام کنی، گاهی اوقات حتی چند دقیقه تاخیر هم باعث از دست رفتن فرصت خرید یا فروش میشه


▪️برای من خرید پله ای معنی نداره و هر سهمی که بهت سیگنال میدم همون لحظه باید تصمیم بگیری که چقدر سرمایه وارد کنی، سهمی که زمان سیگنالش گذشته و مربوط به روزهای قبل هست رو به هیچ وجه نباید الان بری بخری 

▪️پیامی که شب ها تحت عنوان ' نزدیک به سیگنال خرید یا فروش ' برات میفرستم فقط یک هشدار هست که بدونی که روز بعد قراره چه سهامی رو سیگنال بدم و معنی دیگری نداره، اگر مشخص شد که سهم شما نزدیک به سیگنال خرید یا فروش هست هیچ وقت زودتر از من کاری نکن، اجازه بده اول سهم شما رو در تایم بازار سیگنال بدم بعد اقدام کن
          "; 
        //   $text.="\n\n مشترک گرامی ضمن تبریک بابت عضویت در سرویس VIP لطفا به صفحه اپلیکیشن ربات بازگردید و 10 ثانیه صبر نمایید اگر تغییرات اعمال نشد صفحه اپلیکیشن رو یکبار ببندید و دوباره وارد شوید.";
        //   $text.="\n\n به منظور اطلاع از نحوه سیگنالدهی و سایر امکانات ربات به بخش راهنمای ربات واقع در اپلیکیشن مراجعه نمایید";
                $this->telegram->sendMessage($chatId,$text1);
          $this->telegram->sendMessage($chatId,$text2);
           }
           
           $user->is_vip = true;
           $user->purchase_count+=1;
           $user->purchase_date = now();
           $user->visited_symbol_count = 0;
           $user->notified_expiring = 0;
           $user->notified_expired = 0;
           $user->save();
           
           
        //   $keyboard []= [[
        //       'text' => 'ورود به ربات','web_app' => ['url' => 'https://signalhooshmand.ir/mini-app']
        //       ]];
         
        return response()->json(['success' => true]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function deleteVips(Request $request)
    {
 
       try{
           $chatId = $request->input('chat_id');
           if($chatId == '')
           return response()->json(['success' => false]);
           
           $user = User::where('chat_id',$chatId)->first();
           $user->vip_until = now()->subDays(1);
           $user->save();
           $text="⚠️ اشتراک VIP شما توسط ادمین لغو گردید";
           $this->telegram->sendMessage($chatId,$text);
        return response()->json(['success' => true]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function addAdmin(Request $request)
    {
  
       try{
           $chatId = $request->input('chat_id');
           if($chatId == '')
           return response()->json(['success' => false]);
           
           $user = User::where('chat_id',$chatId)->first();
           $user->role = 'admin';
           $user->save();
           $text="🎉 شما ادمین شدید"; 
           $this->telegram->sendMessage($chatId,$text);
        return response()->json(['success' => true]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function deleteAdmin(Request $request)
    {

       try{
           $chatId = $request->input('chat_id');
           if($chatId == '')
           return response()->json(['success' => false]);
           
           $user = User::where('chat_id',$chatId)->first();
           $user->role = 'user';
           $user->save();
           $text="⚠️ دسترسی ادمین شما لغو گردید"; 
           $this->telegram->sendMessage($chatId,$text);
        return response()->json(['success' => true]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function getAdmin(Request $request)
    {

       try{
           
           $user = User::where('role','admin')->get()->pluck('chat_id');
          
        return response()->json(['success' => true,'data' => $user]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function getRange(Request $request)
    {
       try{
           
           $range = Setting::pluck('signal_domain')->first();
          
        return response()->json(['success' => true,'data' => $range]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function setRange(Request $request)
    {
  
       $range = $request->input('range');
       
       try{
           
         $setting = Setting::find(1);
         $setting->signal_domain = $range;
         $setting->save();
          
        return response()->json(['success' => true]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function checkUser(Request $req){
        $chatId = $req->query('id');
        $user = User::where('chat_id',$chatId)->first();
        if($user){
            $data = [
                'chat_id' => $user->chat_id,
                'name' => $user->name,
                'username' => $user->username,
                'purchase_count' => $user->purchase_count,
                'is_vip' => $user->isVip(),
                'remaining_days' => $user->remaining_days
                ];
             return response()->json(['data' => $data]);
        }
        else {
             return response()->json(['data' => null]);
        }
    }
    public function addDaysAll(Request $request)
    {

       $days = $request->input('days');
        
        if($days == '')
       return response()->json(['success' => false]);
      
       try{
           
    //     User::where('vip_until', '>=', now())
    // ->update([
    //     'vip_until' => \DB::raw("DATE_ADD(vip_until, INTERVAL {$days} DAY)")
    // ]); 
    
    User::where('vip_until','>=',now())->cursor()->each(function($user) use($days){
        $user->vip_until = $user->vip_until->addDays(+$days);
        $user->save();
        $text="🎉 $days روز به اشتراک شما اضافه شد";
        $this->telegram->sendMessage($user->chat_id,$text);
    });
    
        return response()->json(['success' => true]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function addDaysVip(Request $request)
    {
 
       $chatId = $request->input('chat_id');
       $days = $request->input('days');
       
       if($chatId == '' || $days == '')
       return response()->json(['success' => false]);
       
       try{
           
        $user = User::where('chat_id',$chatId)->where('vip_until','>=',now())->first();
        $user->vip_until = $user->vip_until->addDays(+$days);
        $user->save();
        $text="🎉 $days روز به اشتراک شما اضافه شد";
         $this->telegram->sendMessage($chatId,$text);
        return response()->json(['success' => true]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
    public function getPlans(Request $request)
    {
 
       try{
           
       $plans = Plan::all();
       
        return response()->json(['data' => $plans]);
       }catch(\Exception $e){
           
        return response()->json(['data' => []]);
       }
        
    }
    public function updatePlans(Request $request)
    {
         $type = $request->input('type');
       $plan = $request->input('plan');

       try{
       $p = Plan::where('type',$type)->first();
           $p->type = $plan['type'];
           $p->period = $plan['period'];
           $p->price = $plan['price'];
           $p->off_price = $plan['off_price'];
           $p->off_percent = $plan['off_percent'];
           $p->save();
           
        return response()->json(['success' => true]);
       }catch(\Exception $e){
           
        return response()->json(['success' => false]);
       }
        
    }
 
    public function sendMessage(Request $request)
   {
    $text = $request->input('text');
    $type = $request->input('type');
    try{
        
    BroadcastJob::create([
        'message' => $text,
        'type' => $type,
        'sent_count' => 0,
        'failed_count' => 0,
        'status' => 'processing',
        ]);
        response()->json(['success' => true,'message' => 'ارسال پیام آغاز شد']);
    }catch(\Exception $e){
        response()->json(['success' => false,'message' => 'خطا در ثبت متن پیام']);
    }
     
}
    
    
    public function guide(Request $request){}
}