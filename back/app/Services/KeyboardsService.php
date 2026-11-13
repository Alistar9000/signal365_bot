<?php

namespace App\Services;
use App\Models\User;

class KeyboardsService
{

    public function backButton()
    {

    return [[
        ['text' => "🔙 بازگشت",'callback_data' => 'back_to_menu']
        ]];
   
    }

    public  function mainMenu($user)
    {
        $keyboard = [
       
            [
                
               ['text' => "\u{200F} 💳 خرید / تمدید سرویس", 'callback_data' => 'buy_service'],
                // ['text' => "\u{200F} 💳 خرید / تمدید سرویس",'web_app' =>['url'=>'https://signal365.ir']],
                
               
            ],
            [
                
               ['text' => "\u{200F} 📈 100 سهم برتر", 'callback_data' => 'top_100'],
                 ['text' => "\u{200F} 📢 لیست هشدار", 'callback_data' => 'alerts_list'],
               
            ],
            [
                
                ['text' => "\u{200F} 📌 سیگنال‌های امروز", 'callback_data' => 'today_signals'],
                
               ['text' => "\u{200F} 📊 بررسی سابقه سهم", 'callback_data' => 'signals_history'],
 
            ],
            [
                  ['text' => "\u{200F} 🆔 شناسه من", 'callback_data' => 'my_id'],
                ['text' => "\u{200F} 💡 راهنمای ربات",
                
                'callback_data' => 'training_videos'],
               
            //   ['text' => "\u{200F} 💡 راهنمای ربات",'web_app' => ['url' => 'https://signalhooshmand.ir/mini-app']]
             
            ],
          
            ];
            
            if($user->role == 'admin')
            $keyboard[] = [
                  ['text' => '⚙️ مدیریت ادمین', 'callback_data' => 'admin_menu'],
                ['text' => "\u{200F} ☎️ ارتباط با ما", 'callback_data' => 'contact_us'],
                
           
        ];
        else 
        $keyboard[]=[
                 
                ['text' => "\u{200F} ☎️ ارتباط با ما", 'callback_data' => 'contact_us'],
                
            ];

        return $keyboard;     
    }

    public  function buyMenu($isVip)
    {
        $keyboard = [];

        if ($isVip) {
            $keyboard[] = [
               ['text' => "🔄 تمدید سرویس", 'callback_data' => 'renew_service']
            ];
        } else {
            $keyboard[] = [
                ['text' => "🛒 خرید سرویس", 'callback_data' => 'purchase_service']
            ];
        }

        $keyboard[] = [['text' => "🔙 بازگشت",
        'callback_data' => 'back_to_menu'
    ]];

        return $keyboard;
    }
    
    public  function buyMenuNotify($isVip)
    {
        $keyboard = [];

        if ($isVip) {
            $keyboard[] = [
               ['text' => "🔄 تمدید سرویس", 'callback_data' => 'renew_service']            ];
        } else {
            $keyboard[] = [
              ['text' => "🛒 خرید سرویس", 'callback_data' => 'purchase_service']
            ];
        }

        return $keyboard;
    }

    /** 📌 کیبورد مخصوص لیست هشدار */
public  function alertsMenu()
{
    $keyboard = [
        [
            ['text' => '➕ افزودن نماد', 'callback_data' => 'alerts_add'],
            ['text' => '➖ حذف نماد', 'callback_data' => 'alerts_remove'],
           
        ],
        
        [
            ['text' => '🗑 حذف کل لیست ', 'callback_data' => 'alerts_all_remove']
        ],
        
        [
            ['text' => '🔙 بازگشت', 'callback_data' => 'back_to_menu']
        ]
        ];
        
        
        return $keyboard;
}

public  function adminMenu($chatId)
{
    $keyboard = [
    
        [
            ['text' => '👥 افزودن روز به همه کاربران', 'callback_data' => 'admin_add_days_all']
        ],
        [
            ['text' => '🧑‍💻 افزودن روز به کاربر خاص', 'callback_data' => 'admin_add_days_user']
        ],
        [
            
            ['text' => '💎 افزودن کاربر VIP', 'callback_data' => 'admin_add_vip'],
            ['text' => '🗑️ حذف کاربر VIP', 'callback_data' => 'admin_remove_vip'],
        ]];
        
        if($chatId == env('ADMIN_CHAT_ID'))
        $keyboard[] = [
            ['text' => '➕ افزودن Admin', 'callback_data' => 'admin_add'],
            ['text' => '➖ حذف Admin', 'callback_data' => 'admin_remove'],
          
            
            ];
            
        $keyboard[] =[
             
            ['text' => '📢 ارسال پیام به VIPها', 'callback_data' => 'admin_broadcast_vip'],
            // ['text' => '👥 تعداد کاربران' , 'callback_data' => 'users_count'],
            ['text' => '👥 تعداد کاربران' , 'web_app' => ['url' => "https://signalhooshmand.ir/mini-app"]],
           
        ];
        
        $keyboard[] = [
            
            ['text' => '💵 تغییر مبلغ سرویس', 'callback_data' =>'change_signal_price'],
            ['text' => '🔄 تغییر بازه سیگنال' , 'callback_data' =>'change_signal_domain'],
        ];
        $keyboard[] = [
            
            ['text' => '🔙 بازگشت', 'callback_data' => 'back_to_menu'],
            ['text' => '⏳تغییر زمان اشتراک', 'callback_data' =>'change_vip_days'],
        ];
        
        return $keyboard;
}
public  function backToAdminMenu()
{
 return [[
    ['text' => '🔙 بازگشت', 'callback_data' => 'back_to_admin_menu']
 ]];

}
public  function backToAlertList()
{
 return [[
    ['text' => '🔙 بازگشت', 'callback_data' => 'back_to_alert_list']
 ]];

}

}

