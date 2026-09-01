<?php

namespace App\Services;

use App\Models\ActivityLog;

/**
 * Class ActivityLogService
 * Mewarisi BaseService (OOP Inheritance)
 * Bertanggung jawab mencatat dan mengambil audit log aktivitas admin dan customer.
 */
class ActivityLogService extends BaseService
{
    /**
     * Catat aktivitas baru ke database.
     */
    public static function record(
        ?int $userId,
        string $action,
        string $description,
        ?array $properties = null,
        ?string $ipAddress = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'properties' => $properties,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }

    /**
     * Ambil daftar log aktivitas terbaru (Admin).
     */
    public function list(int $limit = 50)
    {
        return ActivityLog::with('user')
            ->latest()
            ->limit($limit)
            ->get();
    }
}
