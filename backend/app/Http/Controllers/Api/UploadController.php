<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * POST /api/upload
     * Upload single image file to public storage
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:5120', // max 5MB
            'folder' => 'nullable|string|in:products,avatars',
        ]);

        $folder = $request->input('folder', 'products');
        $path = $request->file('file')->store($folder, 'public');

        $url = '/storage/' . $path;

        return response()->json([
            'url' => $url,
            'full_url' => url($url),
        ]);
    }
}
