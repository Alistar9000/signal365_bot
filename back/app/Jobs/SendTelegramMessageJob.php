<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Telegram\Bot\Api;

class SendTelegramMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected  $userIds;
    protected  $message;

    public function __construct(array $userIds, string $message)
    {
        $this->userIds = $userIds;
        $this->message = $message;
    }

    public function handle(): void
    {
        $telegram = new Api(config('services.telegram-bot.token'));

        foreach ($this->userIds as $chatId) {
            try {
                $telegram->sendMessage([
                    'chat_id' => $chatId,
                    'text'    => $this->message,
                ]);
            } catch (\Exception $e) {
                // \Log::error("❌ خطا در ارسال پیام به کاربر {$chatId}: " . $e->getMessage());
                $telegram->sendMessage([
                    'chat_id' => env('ADMIN_CHAT_ID'),
                    'text'    => '❌ خطا در ارسال پیام به کاربر {$chatId}'
                ]);
            }

            // رعایت محدودیت تلگرام
            usleep(35000); // حدود 30 پیام در ثانیه
        }
    }
}
