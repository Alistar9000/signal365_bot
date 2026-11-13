<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class GenericModel extends Model
{
    protected $table; // جدول به‌صورت داینامیک ست میشه
    // public $timestamps = true; // چون هیچ‌کدوم تایم‌استمپ ندارن
    // protected $primaryKey = null; // برای جدول‌هایی که کلید اصلی ندارن
    // public $incrementing = true; // چون id اتوماتیک نداریم
    // protected $keyType = 'string';

    /**
     * ست کردن نام جدول در زمان اجرا
     */
    public function setTableName(string $table)
    {
          $this->table = $table;

        // بررسی ستون‌های جدول
        $columns = Schema::getColumnListing($table);

        // اگر ستون id وجود داشت => کلید اصلی
        if (in_array('id', $columns)) {
            $this->primaryKey = 'id';
            $this->incrementing = true;
            $this->keyType = 'int';
        } else {
            // اگر id وجود نداشت => کلید اصلی نداریم
            $this->primaryKey = null;
            $this->incrementing = false;
            $this->keyType = 'string';
        }

        return $this;
    }

     public static function table(string $table)
    {
        return (new static())->setTableName($table);
    }
}
