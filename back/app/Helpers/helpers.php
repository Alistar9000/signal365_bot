<?php

use Morilog\Jalali\Jalalian;
use Carbon\Carbon;

if (! function_exists('toJalali')) {
    /**
     * تبدیل تاریخ میلادی به شمسی
     *
     * @param Carbon|\DateTimeInterface|string|int|null $date
     * @param string $format
     * @return string
     */
    function toJalali($date, $format = 'Y/m/d H:i')
    {
        if ($date === null || $date === '') {
            return '';
        }

        try {
            if ($date instanceof \DateTimeInterface) {
                $carbon = Carbon::instance($date);
            } elseif (is_int($date) || (is_string($date) && is_numeric($date))) {
                $carbon = Carbon::createFromTimestamp((int) $date);
            } elseif (is_string($date)) {
                $carbon = Carbon::parse($date);
            } else {
                return '';
            }

            return Jalalian::fromCarbon($carbon)->format($format);
        } catch (\Throwable $e) {
            // در صورت نیاز لاگ کن: \Log::error($e->getMessage());
            return '';
        }
    }
}

if (! function_exists('toJalaliDateOnly')) {
    function toJalaliDateOnly($date)
    {
        if ($date === null || $date === '') {
            return '';
        }

        // اگر ورودی خودش به‌نظر می‌رسه تاریخ شمسی باشه
        // یعنی سالش با 13 یا 14 شروع بشه
        if (is_string($date) && preg_match('/^(13|14)\d{2}\/\d{1,2}\/\d{1,2}$/', trim($date))) {
            // فقط فرمتش رو نرمال کن
            return normalJalaliDate($date);
        }

        // در غیر اینصورت تبدیل معمولی از میلادی به شمسی
        return toJalali($date, 'Y/m/d');
    }
}
if (! function_exists('normalJalaliDate')) {

    function normalJalaliDate($dateString)
    {
         $dateString = trim($dateString);
        
        $date = explode('/', $dateString);
        
        if(!empty($date) && count($date) == 3){
            $year = $date[0];
            $month = $date[1];
            $day = $date[2];
        $month = str_pad($month, 2, '0', STR_PAD_LEFT);
        $day   = str_pad($day, 2, '0', STR_PAD_LEFT);
        
        return "{$year}/{$month}/{$day}";
        }
        else return null;
      
    }
}


