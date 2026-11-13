
<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Services\TelegramBotService;
use Illuminate\Http\Request;

class TelegramBotController extends Controller
{
    protected $bot;

    public function __construct(TelegramBotService $bot)
    {
        $this->bot = $bot;
    }

    public function webhook(Request $request)
    {
        $update = $this->bot->getUpdate();

        if ($update->isType('callback_query')) {
            $this->bot->handleCallback($update->getCallbackQuery());
            return 'ok';
        }

        // 📌 پیام متنی
        if ($update->isType('message')) {
            $message = $update->getMessage();
            $chatId  = $message->getChat()->getId();
            $text    = trim($message->getText());
            $from    = $message->getFrom();
            $user    = User::where('chat_id', $from->getId())->first();
            switch ($text) {
                case "/start":
                    $this->bot->storeOrUpdateUser($from);
                    $this->bot->showMainMenu($chatId, $user);
                    break;
                case "/help":
                    $this->bot->storeOrUpdateUser($from);
                    $this->bot->showHelp($chatId);
                    break;
                default:

                    $this->bot->handleMessage($user, $chatId, $text,$message);
                    break;
            }
            return 'ok';
        }

        return 'ok';
    }
}
