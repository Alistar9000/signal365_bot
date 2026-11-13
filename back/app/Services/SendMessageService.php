<?php

namespace App\Services;

use App\Jobs\SendTelegramMessageJob;

class SendMessageService
{
    /**
     * ارسال پیام به مجموعه‌ای از کاربرها (chat_id)
     */
    public function sendBulk(array $userIds, string $message, int $chunkSize = 50): void
    {
        $chunks = array_chunk($userIds, $chunkSize);

        foreach ($chunks as $group) {
            // هر گروه رو به صف بسپار
            SendTelegramMessageJob::dispatch($group, $message);
        }
    }
}
