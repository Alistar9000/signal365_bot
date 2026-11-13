<?php
namespace App\Console\Commands;

use App\Models\SymbolHistory;
use App\Models\Symbol;
use App\Models\User;
use App\Models\UserAlert;
use App\Models\GenericModel;
use App\Models\Signal;
use App\Models\PaymentToken;
use App\Services\Telegram;
// use App\Services\BourseApiService;
// use App\Services\SignalService;
use Carbon\Carbon;
use Illuminate\Console\Command;


class ClearPaymentTableCommand extends Command
{
    protected $signature   = 'delete:payment_token';
    protected $description = 'دریافت پیام های ناظر بازار از API';

    public function handle()
    {
        
        PaymentToken::where('expires_at','<',now())->delete();
   
    }
}
