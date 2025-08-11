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
        Schema::table('products', function (Blueprint $table) {
            // Kolom untuk menghubungkan ke produk induk. Boleh kosong.
            $table->foreignId('parent_id')->nullable()->constrained('products')->onDelete('cascade');

            // Kolom untuk nama varian, misal: "Iced" atau "Hot"
            $table->string('variant_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::table('products', function (Blueprint $table) {
        $table->dropForeign(['parent_id']);
        $table->dropColumn(['parent_id', 'variant_name']);
    });
}
};
