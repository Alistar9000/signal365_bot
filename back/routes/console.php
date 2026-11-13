<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\CronJob;
use App\Jobs\CronJob2;


Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule::command('delete:payment_token')->withoutOverlapping()->runInBackground();

Schedule::command('notify:users-service')->dailyAt('07:00')->timezone('Asia/Tehran')->withoutOverlapping()->runInBackground();

Schedule::command('update:signal')->days([0,1,2,3,6])->timezone('Asia/Tehran')->between('10:00','12:30')->withoutOverlapping()->runInBackground();

Schedule::command('update:signal-ayar')->days([0,1,2,3,6])->timezone('Asia/Tehran')->between('13:00','13:05')->withoutOverlapping()->runInBackground();

Schedule::command('update:symbols')->days([0,1,2,3,6])->dailyAt('18:05')->timezone('Asia/Tehran')->withoutOverlapping()->runInBackground();



Schedule::command('update:near-signal')->days([0,1,2,3,5,6])->dailyAt('19:30')->timezone('Asia/Tehran')->withoutOverlapping()->runInBackground();
 
Schedule::command('update:telegram-script')->dailyAt('02:00')->timezone('Asia/Tehran')->withoutOverlapping()->runInBackground();
 

// Schedule::command('send:message')->everyMinute()->withoutOverlapping()->runInBackground();
 
 
