<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PaymentToken;
use App\Models\Setting;
use App\Services\KeyboardsService;
use App\Services\Telegram;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    protected $telegram;
    public function __construct(Telegram $telegram)
    {
        $this->telegram = $telegram;
    }
    
    public function start(Request $request)
    {
        $telegramId = $request->get('chat_id');
        $type       = $request->get('type');
        $amount     = Setting::pluck('signal_price')->first(); // مبلغ به تومان
        $callback   = route('payment.callback', ['chat_id' => $telegramId, 'type' => $type]);
        if ($type == 'renew') {
            $text = "تمدید سرویس ویژه ربات سیگنال هوشمند";
        } else {
            $text = "خرید سرویس ویژه ربات سیگنال هوشمند";
        }
        
        
        // درخواست به زرین‌پال
        $response = Http::post('https://api.zarinpal.com/pg/v4/payment/request.json', [
            'merchant_id'  => env('ZARINPAL_MERCHANT_ID'),
            'amount'       => $amount,
            'callback_url' => $callback,
            'description'  => $text,
        ]);

        $data = $response->json();

        if (isset($data['data']['authority'])) {
            $authority = $data['data']['authority'];
            return redirect()->away("https://www.zarinpal.com/pg/StartPay/$authority");
            // return redirect()->away("https://zarinp.al/757495");
        }

        return view('disconnect');
    }

    public function callback(Request $request, KeyboardsService $keyboard)
    {
        $telegramId = $request->get('chat_id');
        $type       = $request->get('type');
        $authority  = $request->get('Authority');
        $status     = $request->get('Status');
        $amount     = Setting::pluck('signal_price')->first();

        $botToken = env('TELEGRAM_BOT_TOKEN'); // توکن ربات

        // دکمه بازگشت به منوی اصلی

        if ($status != 'OK' && $telegramId) {
          
            $this->telegram->sendMessageWithInlineKeyboard(
                $telegramId,
                "❌ <b>پرداخت لغو شد</b>\n\n📌 شما فرآیند پرداخت را ناتمام رها کردید.",
                $keyboard->backButton() 
                );
            
            PaymentToken::where('user_id',$telegramId)->delete();
            return view('canceled');
        }

        // 🔹 تایید تراکنش
        $response = Http::post('https://api.zarinpal.com/pg/v4/payment/verify.json', [
            'merchant_id' => env('ZARINPAL_MERCHANT_ID'),
            'amount'      => $amount,
            'authority'   => $authority,
        ]);

        $data = $response->json();

        if (isset($data['data']['code']) && $data['data']['code'] == 100) {
            
            // ✅ پرداخت موفق
            $user = User::where('chat_id', $telegramId)->first();
            $pc   = $user->purchase_count + 1;
            if ($user) {
                if (! $user->isVip()) {
                    
                    $newDate = Carbon::now()->addDays(114);
                    
                    $user->update([
                        'is_vip'         => true,
                        'vip_until'      => $newDate,
                        'purchase_count' => $pc,
                        'purchase_date'  => now(),
                        'notified_expiring' => false,
                        'notified_expired' => false,
                    ]);

                    $daysLeft = 114;
                } else {
                    
                    $newDate = $user->vip_until->addDays(114);
                    $user->update([
                        'vip_until'      => $newDate,
                        'purchase_count' => $pc,
                        'purchase_date'  => now(),
                        'notified_expiring' => false,
                        'notified_expired' => false,
                    ]);

                    $daysLeft = round(now()->diffInDays($newDate, false));
                }
            }

            $vipUntil = toJalaliDateOnly($newDate);

            if ($type == "renew") {
                $text = "✅ <b>پرداخت موفق</b>\n\n🎉  تبریک! سرویس ویژه شما تمدید گردید.\n\n📅 تاریخ پایان اعتبار: <b>{$vipUntil} ({$daysLeft})</b> روز دیگر\n\n🙏 از اعتماد شما سپاسگزاریم.";
            } else {
                $text = "✅ <b>پرداخت موفق</b>\n\n🎉 تبریک! سرویس ویژه شما فعال شد.\n\n📅 تاریخ پایان اعتبار: <b>{$vipUntil} ({$daysLeft})</b> روز دیگر\n\n🙏 از اعتماد شما سپاسگزاریم.";
            }

               $this->telegram->sendMessageWithInlineKeyboard(
                $telegramId,
                $text,
                $keyboard->backButton() 
                );
            
           
             $a=$type === "renew" ? "🔹 تمدید سیگنال هوشمند\n\n":"🔹 خرید سیگنال هوشمند\n\n";
             $a.="🔹 chatId: $telegramId\n"."🔹 username: ".$user->username."\n🔹 name: ".$user->name."\n🔹 time: ".toJalali(now())."\n🔹 expire time: ".$vipUntil."\n🔹price: ".$amount;

            $this->telegram->sendMessage(
                -1001170860090,
                $a
                );
                
            PaymentToken::where('user_id',$telegramId)->delete();
            return view('success', ['refId' => $data['data']['ref_id'], 'vipUntil' => $vipUntil]);
            // return "✅ پرداخت موفق. شماره تراکنش: " . $data['data']['ref_id'];
        }

        
         $this->telegram->sendMessageWithInlineKeyboard(
                $telegramId,
                "❌ <b>پرداخت ناموفق</b>\n\n⚠️ مشکلی در عملیات پرداخت رخ داد.\n\nلطفاً دوباره تلاش کنید.",
                $keyboard->backButton() 
                );
        
         
         $token = PaymentToken::where('user_id',$telegramId)->first();
         if($token){
             $token->delete();
         }
         
         return view('failed');
    }
}
