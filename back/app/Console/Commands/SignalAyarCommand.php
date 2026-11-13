<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SignalService;
use App\Services\SymbolHistory;
use App\Services\Telegram;


class SignalAyarCommand extends Command
{
    protected $signature = 'update:signal-ayar';
    protected $description = 'ارسال سیگنال‌ها برای کاربران ویژه در تایم بازار';

    public function handle(SignalService $signalService)
    {
        // \Log::info("running cron");
        $signalService->checkSignalAyar();
    }
    
}


