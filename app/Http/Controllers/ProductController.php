<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    public function index()
    {
        $categories = Category::whereHas('products', function ($query) {
            $query->whereNull('parent_id');
        })->with(['products' => function ($query) {
            $query->whereNull('parent_id');
        }])->get();

        return view('index', [
            'categories' => $categories,
            'selectedStore' => session()->get('selected_store', null)
        ]);
    }

    public function show(Product $product)
    {
        if ($product->parent_id) {
            $product = $product->parent;
        }
        
        $product->load('variants.optionGroups.options', 'optionGroups.options');

        $json = File::get(database_path('data/products.json'));
        $allProductsConfig = json_decode($json);
        $productConfig = null;

        foreach ($allProductsConfig as $category) {
            foreach ($category->items as $item) {
                if ($item->name === $product->name) {
                    $productConfig = $item;
                    break 2;
                }
            }
        }
        return view('product-detail', [
            'product' => $product,
            'productConfig' => $productConfig
        ]);
    }
}