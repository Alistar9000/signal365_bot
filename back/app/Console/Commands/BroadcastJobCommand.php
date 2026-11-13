<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Telegram;
use App\Models\User;
use App\Models\BroadcastJob;


class BroadcastJobCommand extends Command
{
    protected $signature = 'send:message';
    protected $description = 'ارسال پیام به کاربران';
   
    
    public function handle(Telegram $telegram)
    {
        
      $jobs = BroadcastJob::where('status', 'processing')->get();

        if ($jobs->isEmpty()) {
            return;
        }

        foreach($jobs as $job){
            $this->ProcessJob($job);
        }
        
    }
    
    private function ProcessJob($job){
        $text = $job->message;
        $type = $job->type;
        
        $totalSent = 0;
        $totalFailed = 0;
        if($type == 'all'){
        User::chunk(100, function ($users) use ($text, &$totalSent, &$totalFailed, $job) {
            foreach ($users as $user) {
                try {
                    // $this->telegram->sendMessage($user->chat_id, $text);
                    $totalSent++;
                } catch (\Exception $e) {
                    $totalFailed++;
                }
            }
            sleep(1);
            
        });
        }else{
        User::where('vip_until','>=',now())->chunk(100, function ($users) use ($text, &$totalSent, &$totalFailed, $job) {
            
            foreach ($users as $user) {
                try {
                    
                    // $this->telegram->sendMessage($user->chat_id, $text);
                    $totalSent++;
                } catch (\Exception $e) {
                    $totalFailed++;
                }
            }
            sleep(1);
        });
        }
      
        $job->update([
            'status' => 'completed',
            'sent_count' => $totalSent,
            'failed_count' => $totalFailed
        ]);
        $resutl_message = "پیام به $totalSent کاربر ارسال شد، ارسال نشده $totalFailed کاربر";
        $this->telegram->sendMessage(1098057719,$result_message);
        $this->telegram->sendMessage(407749551,$result_message);
    }
    
}


