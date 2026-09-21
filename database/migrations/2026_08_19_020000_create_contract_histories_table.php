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
        Schema::create('contract_histories', function (Blueprint $table) {
            $table->id();
            $table->string('contractable_type');
            $table->unsignedBigInteger('contractable_id');
            $table->date('tgl_mulai')->nullable();
            $table->date('tgl_selesai')->nullable();
            $table->string('periode')->nullable();
            $table->string('biaya')->nullable();
            $table->string('no_dokumen')->nullable();
            $table->string('vendor')->nullable();
            $table->string('status')->nullable();
            $table->text('keterangan')->nullable();
            $table->string('user_email')->nullable();
            $table->timestamps();

            $table->index(['contractable_type', 'contractable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_histories');
    }
};
