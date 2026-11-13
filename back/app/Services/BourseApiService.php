<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Services\Telegram;

class BourseApiService
{

    protected $telegram;
    protected $baseUrl;
    protected $secondUrl;
    protected $apiUrl;

    public function __construct(Telegram $telegram)
    {

        $this->baseUrl  = config('services.bot.api_url');
        $this->telegram = $telegram;
        $this->secondUrl = "https://mhs365.ir/url.php";
       
    }

    //** types = ['allsymbols','symbol','symbol20','nazer','market'] */
    public function getData()
    {

        try {
             $response = Http::timeout(10)->get($this->baseUrl);
           
            if ($response->successful()) {
                $data = $response->json();
                    return $data;
            } else {
                $this->telegram->sendMessage(env('ADMIN_CHAT_ID'),'خطا در دریافت  api');
                return null;
            }
        } catch (\Exception $e) {
             $response = Http::timeout(10)->get($this->secondUrl);
              if ($response->successful()) {
                $data = $response->json();
                    return $data;
            }else{ 
            $this->telegram->sendMessage(env('ADMIN_CHAT_ID')
                ,'خطای شبکه یا سرور هنگام اجرای  api');
                
            return null;
            }
        }
    }

}
