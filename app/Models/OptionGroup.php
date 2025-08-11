<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OptionGroup extends Model
{
    use HasFactory;
    protected $guarded = [];

    /**
     * Satu OptionGroup memiliki banyak Option.
     */
    public function options(): HasMany
    {
        return $this->hasMany(Option::class);
    }
}