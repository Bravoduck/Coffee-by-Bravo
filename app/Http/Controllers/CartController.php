<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Option; // Pastikan ini ada
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class CartController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);
        $selectedStore = session()->get('selected_store', null);
        $defaultOptions = Option::where('price', 0)->pluck('name')->toArray();

        $productIds = array_column($cart, 'product_id');
        $products = Product::with('parent')->find($productIds);

        $cartItemsData = [];
        foreach ($cart as $id => $details) {
            $product = $products->find($details['product_id']);
            if ($product) {
                $cartItemsData[$id] = [
                    'id' => $id,
                    'product_id' => $details['product_id'],
                    'slug' => $product->parent->slug ?? $product->slug,
                    'price' => $details['price'],
                    'quantity' => $details['quantity'],
                    'customizations' => $details['customizations'],
                    'variant_name' => $product->variant_name,
                ];
            }
        }

        return view('checkout', [
            'cart' => $cart,
            'cartItemsData' => $cartItemsData,
            'selectedStore' => $selectedStore,
            'defaultOptions' => $defaultOptions
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'customizations' => 'nullable|array',
            'old_cart_item_id' => 'nullable|string'
        ]);

        $productVariant = Product::with('parent')->find($request->product_id);
        $cart = session()->get('cart', []);

        $allCustomizations = [];
        if ($request->has('customizations')) {
            foreach ($request->customizations as $group) {
                $allCustomizations = array_merge($allCustomizations, (array)$group);
            }
        }

        $optionsPrice = Option::whereIn('name', $allCustomizations)->sum('price');
        $basePrice = $productVariant->parent->price ?? $productVariant->price;
        $totalItemPrice = $basePrice + $optionsPrice;

        if ($request->filled('old_cart_item_id') && isset($cart[$request->old_cart_item_id])) {
            unset($cart[$request->old_cart_item_id]);
        }

        $newCartItemId = $productVariant->id . '-' . md5(implode('-', $allCustomizations));

        if (isset($cart[$newCartItemId])) {
            $cart[$newCartItemId]['quantity'] += (int)$request->quantity;
        } else {
            $cart[$newCartItemId] = [
                "id" => $newCartItemId,
                "product_id" => $productVariant->id,
                "name" => $productVariant->parent->name ?? $productVariant->name,
                "slug" => $productVariant->parent->slug ?? $productVariant->slug,
                "quantity" => (int)$request->quantity,
                "price" => $totalItemPrice,
                "image" => $productVariant->image,
                "customizations" => $allCustomizations
            ];
        }

        session()->put('cart', $cart);

        return redirect()->route('checkout.index')->with('status', 'Keranjang berhasil diperbarui!');
    }

    public function remove(Request $request)
    {
        $request->validate(['id' => 'required']);
        $cart = session()->get('cart', []);
        if (isset($cart[$request->id])) {
            unset($cart[$request->id]);
            session()->put('cart', $cart);
        }
        return response()->json([
            'message' => 'Item berhasil dihapus.',
            'cart' => session('cart', [])
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required',
            'quantity' => 'required|integer|min:1'
        ]);
        $cart = session()->get('cart', []);
        if (isset($cart[$request->id])) {
            $cart[$request->id]['quantity'] = $request->quantity;
            session()->put('cart', $cart);
        }
        return response()->json([
            'message' => 'Kuantitas berhasil diperbarui.',
            'cart' => session('cart', [])
        ]);
    }
}