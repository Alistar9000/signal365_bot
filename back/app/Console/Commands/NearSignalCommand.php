<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NearSignalService;
use App\Services\TopSymbolsService;
use App\Services\Telegram;
use App\Models\SymbolHistory;
use App\Models\User;

use Carbon\Carbon;


class NearSignalCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:near-signal';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
   

     public function handle(NearSignalService $nearSignalService)
    {
        $telegram = new Telegram();

       
        $vipUsers = User::where('vip_until', '>=', now());
      
        $chunkSize = 10;
        $pageSize = 10 ;
        $nearSignals =   $nearSignalService->getNearSignals();
        $nearTop100 = $nearSignalService->getNearBuyTop100($nearSignals);
        
        // $vipUsers->chunk($chunkSize)->each(function($usersChunk) use ($pageSize,$nearSignalService,$nearTop100,$telegram){
       
        // $nearSignalService->sendPagedMessageBatch($telegram, $usersChunk, $nearTop100, $pageSize, '🔹 نزدیک به سیگنال خرید (100 سهم برتر)','nearSignalTop100');
        // \Log::info('near runnig');
        // });
        
        $vipUsers->chunkById($chunkSize, function ($usersChunk) 
    use ($pageSize, $nearSignalService, $nearTop100, $telegram) {
       
        $nearSignalService->sendPagedMessageBatch(
        $telegram,
        $usersChunk,
        $nearTop100,
        $pageSize,
        '🔹 نزدیک به سیگنال خرید (سهام برتر) ',
        'nearSignalTop100'
              );
          });
        
        //  $vipUsers->chunk($chunkSize)->each(function($usersChunk) use ($pageSize,$nearSignalService,$nearSignals,$telegram){
        // foreach($usersChunk as $user){
        // $nearSignalService->sendPagedMessageBatch($telegram, $user->chat_id,$nearSignalService->getNearBuyAlerts($user,$nearSignals), $pageSize, '🔹 نزدیک به سیگنال خرید (لیست هشدار)','nearSignalBuyAlert');
        // $nearSignalService->sendPagedMessageBatch($telegram, $user->chat_id, $nearSignalService->getNearSellAlerts($user,$nearSignals), $pageSize, '🔻 نزدیک به سیگنال فروش (لیست هشدار)','nearSignalSellAlert');
        // }
        // });
        $vipUsers->chunkById($chunkSize, function ($usersChunk) 
    use ($pageSize, $nearSignalService, $nearSignals, $telegram) {

    foreach ($usersChunk as $user) {
        //   \Log::info('buy before');
        //  if($user->chat_id === 44161616){
        // \Log::info('buy');
        $nearSignalService->sendPagedMessageBatch(
            $telegram,
            $user->chat_id,
            $nearSignalService->getNearBuyAlerts($user, $nearSignals),
            $pageSize,
            '🔹 نزدیک به سیگنال خرید (لیست هشدار)',
            'nearSignalBuyAlert'
        );
        //  }
    }
});

    $vipUsers->chunkById($chunkSize, function ($usersChunk) 
    use ($pageSize, $nearSignalService, $nearSignals, $telegram) {

    foreach ($usersChunk as $user) {
        //  \Log::info('sell before');
        //  if($user->chat_id === 44161616){
        //   \Log::info('sell');
        $nearSignalService->sendPagedMessageBatch(
            $telegram,
            $user->chat_id,
            $nearSignalService->getNearSellAlerts($user, $nearSignals),
            $pageSize,
            '🔻 نزدیک به سیگنال فروش (لیست هشدار)',
            'nearSignalSellAlert'
        );
        //  }
    }
});
        

        // $this->info('✅ بررسی سهام نزدیک به سیگنال‌ها با نسخه حرفه‌ای انجام شد.');
    }

    
}
