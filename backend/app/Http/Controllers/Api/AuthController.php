<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register customer baru.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Sync ke Supabase Auth & Profiles
        \App\Services\SupabaseSyncService::syncUserSignup(
            $validated['email'],
            $validated['password'],
            $validated['name'],
            'customer'
        );

        \App\Services\ActivityLogService::record(
            $user->id,
            'USER_REGISTER',
            "Customer baru {$user->name} ({$user->email}) berhasil mendaftar.",
            ['email' => $user->email]
        );

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login user (customer atau admin).
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Hapus token lama dan buat token baru
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        \App\Services\ActivityLogService::record(
            $user->id,
            'USER_LOGIN',
            "User {$user->name} ({$user->role}) berhasil masuk ke sistem.",
            ['email' => $user->email, 'role' => $user->role]
        );

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Ambil data user yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Update profil user yang sedang login.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'avatar_url' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user,
        ]);
    }

    /**
     * Logout user & revoke token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}
