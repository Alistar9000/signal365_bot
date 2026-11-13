<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class Telegram
{
    protected  $botToken;
    protected  $apiUrl;

    public function __construct()
    {
        $this->botToken = env('BOT_TOKEN');
        $this->apiUrl = "https://api.telegram.org/bot{$this->botToken}/";
        
        // $this->botToken = "727583775:IgbBWkjROYjh9HzZ_Oqfx20XXcZ7ard4UuA";
        // $this->apiUrl = "https://tapi.bale.ai/bot{$this->botToken}/";
    }
    
   

    /** ارسال پیام متنی */
    public function sendMessage(string $chatId, string $text, array $options = [])
    {
        $payload = array_merge([
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
        ], $options);

        return $this->request('sendMessage', $payload);
    }

    /** ارسال پیام با دکمه‌های Inline */
    public function sendMessageWithInlineKeyboard(string $chatId, string $text, array $buttons)
    {
        $keyboard = ['inline_keyboard' => $buttons];
        return $this->sendMessage($chatId, $text, [
            'reply_markup' => json_encode($keyboard)
        ]);
    }

    /** ارسال پیام با Reply Keyboard */
    public function sendMessageWithKeyboard(string $chatId, string $text, array $keyboard, bool $resize = true, bool $oneTime = false)
    {
        $replyKeyboard = [
            'keyboard' => $keyboard,
            'resize_keyboard' => $resize,
            'one_time_keyboard' => $oneTime
        ];

        return $this->sendMessage($chatId, $text, [
            'reply_markup' => json_encode($replyKeyboard)
        ]);
    }

    /** ارسال عکس */
    public function sendPhoto(string $chatId, string $photoUrl, string $caption = '', array $options = [])
    {
        return $this->request('sendPhoto', array_merge([
            'chat_id' => $chatId,
            'photo' => $photoUrl,
            'caption' => $caption,
            'parse_mode' => 'HTML',
        ], $options));
    }

    /** ارسال فایل */
    public function sendDocument(string $chatId, string $fileUrl, string $caption = '', array $options = [])
    {
        return $this->request('sendDocument', array_merge([
            'chat_id' => $chatId,
            'document' => $fileUrl,
            'caption' => $caption,
            'parse_mode' => 'HTML',
        ], $options));
    }
    
    public function sendVoice(string $chatId, string $fileUrl, string $caption = '', array $options = [])
    {
        return $this->request('sendVoice', array_merge([
            'chat_id' => $chatId,
            'voice' => $fileUrl,
            'caption' => $caption,
            'parse_mode' => 'HTML',
        ], $options));
    }
    public function sendAudio(string $chatId, string $fileUrl, string $caption = '', array $options = [])
    {
        return $this->request('sendAudio', array_merge([
            'chat_id' => $chatId,
            'audio' => $fileUrl,
            'caption' => $caption,
            'parse_mode' => 'HTML',
        ], $options));
    }
    
    public function sendVideo(string $chatId, string $videoUrl, string $caption = '', array $options = [])
{
    $payload = array_merge([
        'chat_id' => $chatId,
        'video' => $videoUrl,
        'caption' => $caption,
        'parse_mode' => 'HTML',
    ], $options);

    return $this->request('sendVideo', $payload);
}

    /** پاسخ به callback query */
    public function answerCallbackQuery(string $callbackQueryId, string $text = '', bool $showAlert = false)
    {
        return $this->request('answerCallbackQuery', [
            'callback_query_id' => $callbackQueryId,
            'text' => $text,
            'show_alert' => $showAlert
        ]);
    }

    /** دریافت updates از webhook */
    public function getUpdateFromRequest(array $requestData)
    {
        return $requestData;
    }

    /** تابع عمومی درخواست به API */
   protected function request(string $method, array $payload)
{
    try {

        $response = Http::withHeaders([
                'Connection' => 'keep-alive',
            ])
            // ->retry(3, 1000)
            ->timeout(5)
            ->connectTimeout(3)
            ->post($this->apiUrl .$method, $payload);
        // $response = Http::Post($this->apiUrl .$method, $payload);

        if ($response->successful()) {
            return $response->json();
        }

        return null;

    } catch (\Exception $e) {

        \Log::error('Bale API failed', [
            'error' => $e->getMessage()."***".json_encode($payload)
        ]);
        // \Log::info(json_encode($payload));
        // \Log::info("failed sent nearSignal chat_id :".$payload['chat_id']);
        // $vip_until = \App\Models\User::where('chat_id',$payload['chat_id'])->pluck('vip_until')->first();
        // \DB::table('invalid_users')->insert(["chat_id" => $payload['chat_id'],"vip_until" => $vip_until ]);
        return null;

    }
}

    public function editMessageText(string $chatId, int $messageId, string $newText, array $keyboard = [])
{
    
    $payload =[
        'chat_id' => $chatId,
        'message_id' => $messageId,
        'text' => $newText,
        'parse_mode' => 'HTML',
        'reply_markup' => json_encode(['inline_keyboard' => $keyboard])
    ];

    return $this->request('editMessageText', $payload);
}
}