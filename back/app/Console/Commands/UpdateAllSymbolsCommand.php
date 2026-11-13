<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BourseApiService;
use App\Models\Symbol;
use Carbon\Carbon;

class UpdateAllSymbolsCommand extends Command
{
    protected $signature = 'symbols:fetch-all';
    protected $description = 'دریافت و بروزرسانی اطلاعات قیمتی تمام سهام از API';

    public function handle(BourseApiService $bourseApi)
    {
        
        $symbols = $bourseApi->getData('allsymbols');
        $specificNames = [
            'اهرم',
            'موج',
            'جهش',
            'توان',
            'بیدار',
            'شتاب',
            'نارنج اهرم',
            'صنم',
            'تمشک',
            'ارزش مسکن',
            'کلید',
            'دانیک',
            'دارا یکم',
            'پالایش'
            ];
       
        $filteredItems = array_filter($symbols, function ($item) use ($specificNames) {
        return preg_match('/^IRO[135]/', $item['namad_code']) 
            || in_array($item['name'], $specificNames);
    });
    
    $filteredItems = array_values($filteredItems);
    
    $symbolsData = collect($filteredItems)->map(function ($item) {
            return [
                'name'  => $item['name'],
                'code'  => $item['namad_code'],
                'close' => $item['close_price'],
                'first' => $item['first_price'],
                'high'  => $item['highest_price'],
                'low'   => $item['lowest_price'],
            ];
        })->toArray();

        Symbol::upsert(
            $symbolsData,
            ['code'], // ستون یکتا
            ['name', 'close', 'first', 'high', 'low'] // ستون‌هایی که آپدیت میشن
        );

        $this->info("اطلاعات نمادها با موفقیت آپدیت شد ✅");
    }
}
