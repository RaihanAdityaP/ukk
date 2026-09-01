<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    protected ActivityLogService $logService;

    public function __construct(ActivityLogService $logService)
    {
        $this->logService = $logService;
    }

    /**
     * GET /api/admin/logs (Admin Only)
     */
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 50), 100);
        $logs = $this->logService->list($limit);

        return response()->json($logs);
    }
}
