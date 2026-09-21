<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jenis_meubelairs', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->timestamps();
        });

        $defaults = ['Meja', 'Kursi', 'Lemari', 'Sofa', 'AC'];
        $now = now();
        foreach ($defaults as $item) {
            \Illuminate\Support\Facades\DB::table('jenis_meubelairs')->insertOrIgnore([
                'nama' => $item,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_meubelairs');
    }
};
