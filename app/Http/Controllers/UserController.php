<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|in:admin,user',
        ]);

        $user = User::findOrFail($id);
        $oldRole = $user->role;
        
        if ($user->id === auth()->user()->id) {
            return redirect()->back()->withErrors(['role' => 'Anda tidak bisa mengubah role Anda sendiri!']);
        }

        $user->update([
            'role' => $request->role,
        ]);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Ubah Hak Akses',
            'module' => 'Kelola Akses',
            'details' => "Mengubah hak akses user {$user->email} dari {$oldRole} menjadi {$user->role}",
        ]);

        return redirect()->back()->with('message', 'Role user berhasil diperbarui');
    }
}
