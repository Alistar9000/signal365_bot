<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TelegramBotService;
use App\Services\Telegram;
use App\Models\User;

class TelegramController extends Controller
{
    protected  $telegram;
    protected $botService;
    public function __construct(Telegram $telegram,TelegramBotService $botService)
    {
        $this->telegram = $telegram;
        $this->botService = $botService;
    }

    /**
     * دریافت Webhook از تلگرام
     */
    public function handle(Request $request)
    {
       
        $update = $this->telegram->getUpdateFromRequest($request->all());
        response()->json(['status' => 'ok'])->send();
        // پیام متنی
        if (isset($update['message'])) {
            $chatId = $update['message']['chat']['id'];
            $text = $update['message']['text'] ?? '';
            $from = $update['message']['from'];
            $message = $update['message'];
           
            // $this->botService->storeOrUpdateUser($from);
            
             switch ($text) {
                case "/start":
                    
                    // $this->botService->showMainMenu($chatId);
                   
                   $t= "سلام 👋 به ربات سیگنال هوشمند خوش آمدید، لطفا بر روی دکمه زیر بزنید و وارد ربات شوید"." ".$chatId;
                //   $t.="\n\n ⚠️ برای ورود به ربات از فیلترکشن استفاده کنید";
                   $keyboard = [
                      [[
                           'text' => 'ورود به ربات',
                           'web_app' => ['url' => 'https://signal365.ir/mini-app']
                        //   'web_app' => ['url' => 'https://signalhooshmand.ir/mini-app']
                           ]
                       ]];
                    $adminKeyboard = [
                        [['text' => 'ارسال پیام به VIP','callback_data' => 'admin_broadcast_vip'],[
                            'text' => 'ارسال پیام به همه',
                            'callback_data' => 'admin_broadcast_all'
                           ]],
                            [[
                           'text' => 'ورود به ربات',
                        //   'web_app' => ['url' => 'https://signalhooshmand.ir/mini-app']
                           'web_app' => ['url' => 'https://signal365.ir/mini-app']
                           ]]
                        ];   
                        if($chatId == 36543498)
                   $this->telegram->sendMessageWithInlineKeyboard($chatId,$t,$adminKeyboard);
                   else
                   $this->telegram->sendMessageWithInlineKeyboard($chatId,$t,$keyboard);
                    break;
                    
                default:
                   
                   $this->botService->handleMessage($chatId,$message);
                    break;
            }
        }

        if (isset($update['callback_query'])) {
            
            $callbackId = $update['callback_query']['id'];
            
            $this->telegram->answerCallbackQuery($callbackId,"");
            
            $this->botService->handleCallback($update['callback_query']);
           
        }

        return response()->json(['status' => 'ok']);
    }
}