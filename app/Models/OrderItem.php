<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $casts = [
        'customizations' => 'array',
    ];

    /**
     * Mendefinisikan bahwa satu item pesanan adalah milik satu produk.
     * Ini adalah relasi yang hilang sebelumnya dan menjadi penyebab utama error.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
