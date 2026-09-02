<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    /**
     * POST /api/upload
     * Upload single image file directly to Supabase Storage (product-images or avatars)
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:5120', // max 5MB
            'folder' => 'nullable|string|in:products,avatars',
        ]);

        $folder = $request->input('folder', 'products');
        $file = $request->file('file');

        $url = SupabaseSyncService::uploadStorageFile($file, $folder);

        return response()->json([
            'url' => $url,
            'full_url' => $url,
        ]);
    }
}
