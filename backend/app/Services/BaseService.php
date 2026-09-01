<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Closure;
use Exception;

/**
 * Class BaseService (Abstract Class)
 * Menjadi blueprint dasar untuk seluruh OOP Service di aplikasi ini.
 * Menerapkan prinsip Abstraction dan Encapsulation untuk transaksi database dan error handling.
 */
abstract class BaseService
{
    /**
     * Menjalankan operasi di dalam DB Transaction secara aman.
     *
     * @param Closure $callback
     * @return mixed
     * @throws Exception
     */
    protected function transaction(Closure $callback): mixed
    {
        return DB::transaction($callback);
    }
}
