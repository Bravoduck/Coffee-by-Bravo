<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\OptionGroup;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('data/products.json'));
        $data = json_decode($json);

        foreach ($data as $categoryData) {
            $category = Category::firstOrCreate(
                ['slug' => $categoryData->slug],
                ['name' => $categoryData->category]
            );

            foreach ($categoryData->items as $productData) {
                // Membuat produk utama (parent)
                $parentProduct = Product::create([
                    'category_id' => $category->id,
                    'name' => $productData->name,
                    'slug' => Str::slug($productData->name),
                    'description' => $productData->description,
                    'image' => $productData->image,
                    'price' => $productData->price,
                    'is_sold_out' => $productData->soldOut ?? false,
                ]);

                // =================================================================
                // >> LOGIKA BARU DIMULAI DARI SINI <<
                // =================================================================

                // Logika untuk produk TANPA varian (seperti Fore Junior)
                if (isset($productData->options_config)) {
                    // 1. Ambil nama semua grup dari keys 'options_config'
                    $groupNames = array_keys(get_object_vars($productData->options_config));
                    
                    // 2. Cari ID grup-grup tersebut di database
                    $groupIds = OptionGroup::whereIn('name', $groupNames)->pluck('id');

                    // 3. Hubungkan produk ini hanya dengan grup-grup tersebut
                    $parentProduct->optionGroups()->sync($groupIds);
                }

                // Logika untuk produk DENGAN varian (Iced/Hot)
                if (isset($productData->variants) && is_array($productData->variants)) {
                    foreach ($productData->variants as $variant) {
                        $childProduct = Product::create([
                            'category_id' => $category->id,
                            'parent_id' => $parentProduct->id,
                            'name' => $productData->name,
                            'variant_name' => $variant->name,
                            'slug' => Str::slug($productData->name . ' ' . $variant->name),
                            'description' => $productData->description,
                            'image' => $productData->image,
                            'price' => $productData->price,
                            'is_sold_out' => $productData->soldOut ?? false,
                        ]);
                        
                        // Menghubungkan varian ke grup opsi yang sesuai dari 'products.json'
                        if (isset($variant->options_config)) {
                            // 1. Ambil nama semua grup dari keys 'options_config' di dalam varian
                            $groupNames = array_keys(get_object_vars($variant->options_config));

                            // 2. Cari ID grup-grup tersebut di database
                            $groupIds = OptionGroup::whereIn('name', $groupNames)->pluck('id');
                            
                            // 3. Hubungkan produk varian ini hanya dengan grup-grup tersebut
                            $childProduct->optionGroups()->sync($groupIds);
                        }
                    }
                }
            }
        }
    }
}