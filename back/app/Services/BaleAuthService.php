<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class BaleAuthService
{
    protected $botToken;

    public function __construct()
    {
        // توکن بات رو از کانفیگ یا env بخون
        $this->botToken = env('BOT_TOKEN');
    }

    /**
     * اعتبارسنجی initData ارسالی از سمت بله
     *
     * @param string $initData
     * @return array|null
     * @throws \Exception
     */
    public function validateInitData(string $initData): ?array
    {
        // ۱. تبدیل رشته URL-encoded به آرایه
        parse_str($initData, $data);

        // ۲. بررسی وجود فیلدهای ضروری
        if (!isset($data['user']) || !isset($data['hash']) || !isset($data['auth_date'])) {
            throw new \Exception('داده‌های ناقص یا نامعتبر.');
        }

        // ۳. ساخت Data Check String
        // کلیدها باید به ترتیب حروف الفبا مرتب بشن
        ksort($data);

        $dataCheckString = '';
        foreach ($data as $key => $value) {
            if ($key === 'hash') {
                continue; // هش نباید در محاسبه شرکت کنه
            }
            $dataCheckString .= $key . '=' . $value . "\n";
        }
        // حذف خط آخر اضافی اگر وجود داره
        $dataCheckString = rtrim($dataCheckString, "\n");

        // ۴. محاسبه کلید مخفی (Secret Key)
        // طبق مستندات بله: secret_key = HMAC-SHA256(bot_token, "WebAppData")
        $secretKey = hash_hmac('sha256', $this->botToken, 'WebAppData', true);

        // ۵. محاسبه هش داده‌ها
        $calculatedHash = hash_hmac('sha256', $dataCheckString, $secretKey, true);
        $calculatedHashHex = bin2hex($calculatedHash);

        // ۶. مقایسه هش‌ها
        if ($calculatedHashHex !== $data['hash']) {
            // Log::error('Bale Auth Failed: Hash mismatch', [
            //     'expected' => $calculatedHashHex,
            //     'received' => $data['hash']
            // ]);
            throw new \Exception('اعتبارسنجی امنیتی ناموفق بود.');
        }

        // ۷. بررسی تاریخ انقضا (Auth Date)
        // معمولاً ۵ دقیقه (۳۰۰ ثانیه) مجاز هست
        // $authDate = (int) $data['auth_date'];
        // $currentTime = time();

        // if (($currentTime - $authDate) > 300) {
        //     throw new \Exception('داده‌های ارسالی منقضی شده‌اند.');
        // }

        // ۸. بازگرداندن اطلاعات کاربر
        // فیلد user یک رشته JSON هست که باید دیکد بشه
        $userData = json_decode($data['user'], true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('فرمت داده‌های کاربر نامعتبر است.');
        }
        // Log::info('user: '.$userData);
        return $userData;
    }
}
