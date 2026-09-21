<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|string|in:admin,logistic_officer,guest,user',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah User',
            'module' => 'Manajemen User',
            'details' => "Menambahkan user baru {$user->name} ({$user->email}) dengan hak akses {$user->role}",
        ]);

        return redirect()->back()->with('message', 'User berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6|confirmed',
            'role' => 'required|string|in:admin,logistic_officer,guest,user',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit User',
            'module' => 'Manajemen User',
            'details' => "Memperbarui data user {$user->email}",
        ]);

        return redirect()->back()->with('message', 'Data user berhasil diperbarui');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->user()->id) {
            return redirect()->back()->withErrors(['error' => 'Anda tidak bisa menghapus akun Anda sendiri!']);
        }

        $email = $user->email;
        $user->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus User',
            'module' => 'Manajemen User',
            'details' => "Menghapus user {$email}",
        ]);

        return redirect()->back()->with('message', 'User berhasil dihapus');
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|in:admin,logistic_officer,guest,user',
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
