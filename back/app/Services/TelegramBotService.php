<?php
namespace App\Services;

use App\Models\User;
use App\Services\KeyboardsActionsService;
use App\Services\KeyboardsService;
use App\Services\Telegram;
use App\Services\MessageActionsService;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class TelegramBotService
{
    protected $telegram;
    protected $keyboardActions;
    protected $keyboard;
    protected $mas;
    public function __construct(KeyboardsActionsService $keyboardActions,Telegram $telegram,KeyboardsService $keyboard,MessageActionsService $mas)
    {
        $this->telegram        = $telegram;
        $this->keyboard        = $keyboard;
        $this->mas             = $mas;
        $this->keyboardActions = $keyboardActions;
    }

    /**
     * کیبورد اصلی ربات
     */

    // public function getUpdate()
    // {
    //     return $this->telegram->getWebhookUpdate();
    // }

    /**
     * متن خوش‌آمد
     */
    public function welcomeText()
    {
        return "سلام
        👋
        من ربات سیگنال هوشمند هستم و بهت کمک میکنم که بتونی بهتر ترید کنی ، از منو یکی از گزینه های زیر رو انتخاب کن:";
    }
     
    public function unknowText()
    {
        return "❌ دستور نامعتبر";
    }



public function handleCallback($callback)
{
            $chatId = $callback['message']['chat']['id'];
            $messageId = $callback['message']['message_id'];
            $data = $callback['data'];
            $from = $callback['from'];

            // $this->storeOrUpdateUser($from);

            $keyboardActions = $this->keyboardActions;

            switch ($data) {
                // case 'users_count':
                //     $keyboardActions->handleUsersCount($chatId, $messageId, $from);
                //     break;
                // case 'buy_service':
                //     // $this->storeOrUpdateUser($from);
                //     $keyboardActions->handleBuyOrRenew($chatId, $messageId, $from);
                //     break;
                // case 'alerts_list':
                //     $keyboardActions->handleAlertsList($chatId, $messageId, $from);
                //     break;
                // case 'top_100':
                //     $keyboardActions->handleTop100($chatId, $messageId, $from);
                //     break;
                // case 'signals_history':
                //     $keyboardActions->handleSignalsHistory($chatId, $messageId, $from);
                //     break;
                // case 'today_signals':
                //     $keyboardActions->handleTodaySignals($chatId, $messageId, $from);
                //     break;
                // case 'training_videos':
                //     $keyboardActions->handleTrainingVideos($chatId, $messageId, $from);
                //     break;
                // case 'my_id':
                //     $keyboardActions->handleMyId($chatId, $messageId, $from);
                //     break;
                // case 'contact_us':
                //     $keyboardActions->handleContactUs($chatId, $messageId, $from);
                //     break;
                // case 'renew_service':
                //     $keyboardActions->handleRenewService($chatId, $messageId, $from);
                //     break;
                // case 'purchase_service':
                //     $keyboardActions->handlePurchaseService($chatId, $messageId, $from);
                //     break;
                // case 'back_to_menu':
                //     $keyboardActions->handleBackToMenu($chatId, $messageId, $from);
                //     break;
                // case 'back_to_alert_list':
                //     $keyboardActions->handleBackToAlertList($chatId, $messageId, $from);
                //     break;
                   
                // case 'alerts_add':
                //     $keyboardActions->handleAlertsAdd($chatId, $messageId, $from);
                //     break;
                // case 'alerts_remove':
                //     $keyboardActions->handleAlertsRemove($chatId, $messageId, $from);
                //     break;
                // case 'alerts_all_remove':
                //     $keyboardActions->handleAlertsRemove($chatId, $messageId, $from,1);
                //     break;
                // case 'admin_menu':
                //     $keyboardActions->handleAdminMenu($chatId, $messageId, $from);
                //     break;
                // case 'admin_add_vip':
                //     $keyboardActions->handleAdminAddVip($chatId, $messageId, $from);
                //     break;
                // case 'admin_remove_vip':
                //     $keyboardActions->handleAdminRemoveVip($chatId, $messageId, $from);
                //     break;
                // case 'admin_add_days_all':
                //     $keyboardActions->handleAdminAddDaysAll($chatId, $messageId, $from);
                //     break;
                // case 'admin_add_days_user':
                //     $keyboardActions->handleAdminAddDaysUser($chatId, $messageId, $from);
                //     break;
                case 'admin_broadcast_vip':
                    $keyboardActions->handleAdminBroadcastVip($chatId, $messageId, $from);
                    break;
                case 'admin_broadcast_all':
                    $keyboardActions->handleAdminBroadcastAll($chatId, $messageId, $from);
                    break;
                // case 'admin_add':
                //     $keyboardActions->handleAdminAddRemove('add',$chatId, $messageId, $from);
                //     break;
                // case 'admin_remove':
                //     $keyboardActions->handleAdminAddRemove('dell',$chatId, $messageId, $from);
                //     break;
                // case 'back_to_admin_menu':
                //     $keyboardActions->handleBackToAdminMenu($chatId, $messageId, $from);
                //     break;
                // case 'change_signal_domain':
                //     $keyboardActions->handleChangeSignalDomain($chatId, $messageId, $from);
                //     break;
                // case 'change_signal_price':
                //     $keyboardActions->handleChangeSignalPrice($chatId, $messageId, $from);
                //     break;
                // case 'change_vip_days':
                //     $keyboardActions->handleChangeVipDays($chatId, $messageId, $from);
                //     break;
                default:
                  if (preg_match('/page_(\d+)$/', $data, $matches)) {
                 $page = (int) $matches[1];
                 $type = preg_replace('/_page_\d+$/', '', $data);
                  $keyboardActions->handlePages($chatId, $messageId, $page, $type);
                    } else {
                        $keyboardActions->handleUnknown($chatId, $messageId, $from);
                    }
            }
      
}

    public function handleMessage($chatId,$message)
    {
        $user    = User::where('chat_id', $chatId)->first();
        
        if(!$user){
            
         $this->telegram->sendMessage($chatId,$this->unknowText());
         return;
        }
        // \DB::disconnect();
        switch ($user->currentState()) {

            // case "awaiting_change_signal_domain":
            //     $this->mas->AwaitingChangeSignalDomain($user, $text, $chatId);
            //     break;
            // case "awaiting_change_vip_days":
            //     $this->mas->AwaitingChangeVipDays($user, $text, $chatId);
            //     break;
            // case "awaiting_change_signal_price":
            //     $this->mas->AwaitingChangeSignalPrice($user, $text, $chatId);
            //     break;
            // case "awaiting_alerts_add":
            //     $this->mas->AwaitingAlertsAdd($user, $text, $chatId);
            //     break;
            // case "awaiting_alerts_remove":
            //     $this->mas->AwaitingAlertsRemove($user, $text, $chatId);
            //     break;
            // case "awaiting_days_all":
            //     $this->mas->AwaitingDaysAll($user, $text, $chatId);
            //     break;
            // case "awaiting_days_user_chatid":
            //     $this->mas->AwaitingDaysUserChatid($user, $text, $chatId);
            //     break;
            // case "awaiting_days_user_days":
            //     $this->mas->AwaitingDaysUserDays($user, $text, $chatId);
            //     break;
            // case "awaiting_add_vip_chatid":
            //     $this->mas->AwaitingAddVipChatid($user, $text, $chatId);
            //     break;
            // case "awaiting_delete_vip_chatid":
            //     $this->mas->AwaitingDeleteVipChatid($user, $text, $chatId);
            //     break;
            // case "awaiting_symbol_for_signalhistory":
            //     $this->mas->AwaitingSymbolForSignalHistory($user, $text, $chatId);
            //     break;
            // case "awaiting_admin_add":
            //     $this->mas->AwaitingAddRemoveAdmin('add',$user, $text, $chatId);
            //     break;
            // case "awaiting_admin_remove":
            //     $this->mas->AwaitingAddRemoveAdmin('remove',$user, $text, $chatId);
            //     break;
            case "awaiting_broadcast_vip":
                $this->mas->AwaitingBroadcastVip($user,$chatId,$message);
                break;
            case "awaiting_broadcast_all":
                $this->mas->AwaitingBroadcastAll($user,$chatId,$message);
                break;
                
            default:
                 $this->telegram->sendMessage($chatId,$this->unknowText());
                break;
        }
       
    }

    /**
     * نمایش منوی اصلی
     */
    public function showMainMenu($chatId)
    {
        $user    = User::where('chat_id', $chatId)->first();
        //  \DB::disconnect();
        $this->telegram->sendMessageWithInlineKeyboard($chatId,$this->welcomeText(),$this->keyboard->mainMenu($user));
    }

    /**
     * نمایش help
     */

    public function storeOrUpdateUser($from)
    {
        $first = $from['first_name'] ?? '';
        $last = $from['last_name'] ?? '';
        $user = $from['username'] ?? '';
        
        
        $s = User::updateOrCreate(
            ['chat_id' => $from['id']],
            [
                'name'          => trim($first) ." ".$last,
                'username'      => $user,
                'last_activity' => now(),
            ]
        );
        //  \DB::disconnect();
         return $s;
    }

}
