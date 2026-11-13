<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class UpdateTelegramScriptCommand extends Command
{
    protected $signature   = 'update:telegram-script';
    protected $description = 'دریافت و بروزرسانی اطلاعات قیمتی تمام سهام از API';

    public function handle()
    {
         try {
            // 1. دانلود فایل از سرور تلگرام
            $response = Http::timeout(30)->get('https://telegram.org/js/telegram-web-app.js');

            if ($response->successful()) {
                $content = $response->body();

                // 2. ذخیره در فایل محلی (مسیر public/assets/js/telegram.js)
                $path = base_path('../public_html/mini-app/telegram.js');
                
                // اطمینان از وجود دایرکتوری
                if (!file_exists(dirname($path))) {
                    mkdir(dirname($path), 0755, true);
                }

                // نوشتن محتوای جدید در فایل
                file_put_contents($path, $content);

                $this->info('✅ اسکریپت تلگرام با موفقیت به‌روزرسانی شد!');
                
                // (اختیاری) برای جلوگیری از کش شدن توسط مرورگر، یک فایل نسخه نیز به‌روزرسانی کنید
                $version = time();
                file_put_contents(base_path('../public_html/mini-app/telegram-version.txt'), $version);
                // \Log::info("📌 نسخه جدید: {$version}");

            } else {
                // \Log::info('❌ خطا در دانلود فایل: ' . $response->status());
            }

        } catch (\Exception $e) {
            // \Log::info('❌ خطا: ' . $e->getMessage());
        }
    
    }
}
