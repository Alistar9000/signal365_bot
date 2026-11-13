<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TelegramBotService;
use App\Services\Telegram;
use App\Models\User;

class MhsController extends Controller
{
   
    public function __construct()
    {
       
    }

    /**
     * دریافت Webhook از تلگرام
     */
    public function handle(Request $request)
    {
        
        redirect()->away('/mhs/index.php');
       
    }
}