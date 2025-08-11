<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StoreController;

// Halaman utama
Route::get('/', [ProductController::class, 'index']);

// Halaman detail produk
Route::get('/product/{product:slug}', [ProductController::class, 'show'])->name('product.show');

// Halaman Checkout
Route::get('/checkout', [CartController::class, 'index'])->name('checkout.index');

// Aksi untuk keranjang
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/checkout/remove', [CartController::class, 'remove'])->name('checkout.remove');
Route::post('/checkout/update', [CartController::class, 'update'])->name('checkout.update');

// Aksi untuk memproses pembayaran
Route::post('/checkout/process', [OrderController::class, 'process'])->name('checkout.process');

// Route untuk menampilkan halaman daftar store
Route::get('/stores', [StoreController::class, 'index'])->name('stores.index');

// Route untuk memproses pemilihan store
Route::get('/stores/select/{store}', [StoreController::class, 'select'])->name('stores.select');

// Untuk receive notifikasi dari Midtrans (webhook)
Route::post('/midtrans/notification', [OrderController::class, 'notification']);

// Untuk request Snap Token ulang (optional, untuk frontend)
Route::get('/midtrans/snap-token/{order}', [OrderController::class, 'getSnapToken']);