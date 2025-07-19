<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewOrderNotification;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;
use App\Models\Option; // <-- 1. PASTIKAN MODEL OPTION DI-IMPORT

class OrderController extends Controller
{
    /**
     * Memproses pesanan, menyimpannya ke database, dan mendapatkan token Midtrans.
     */
    public function process(Request $request)
    {
        // Validasi data
        $request->validate([
            'customer_name' => 'required|string|max:255',
        ]);
        $cart = session()->get('cart', []);
        $selectedStore = session()->get('selected_store');
        $customerName = $request->input('customer_name');

        if (empty($cart) || !$selectedStore) {
            return response()->json(['error' => 'Data tidak lengkap.'], 400);
        }

        // ▼▼▼ TAMBAHKAN KODE INI ▼▼▼
        // 2. Ambil semua nama opsi yang harganya 0 (opsi default)
        $defaultOptions = Option::where('price', 0)->pluck('name')->toArray();
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        // Hitung total harga di server dan siapkan detail item untuk Midtrans
        $totalPrice = 0;
        $item_details = [];
        foreach ($cart as $id => $details) {
            $totalPrice += $details['price'] * $details['quantity'];

            // ▼▼▼ UBAH LOGIKA PEMBUATAN NAMA ITEM ▼▼▼
            $itemName = $details['name'];
            
            // 3. Saring kustomisasi untuk membuang opsi default
            $nonDefaultCustomizations = [];
            if (!empty($details['customizations'])) {
                $nonDefaultCustomizations = array_diff($details['customizations'], $defaultOptions);
            }
            
            // Tambahkan hanya kustomisasi non-default ke nama item
            if (!empty($nonDefaultCustomizations)) {
                $customText = implode(', ', $nonDefaultCustomizations);
                $itemName .= ' (' . $customText . ')';
            }

            // Batasi panjang nama item sesuai aturan Midtrans
            $itemName = substr($itemName, 0, 50);
            // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

            $item_details[] = [
                'id'       => $id,
                'name'     => $itemName,
                'price'    => (int) $details['price'],
                'quantity' => (int) $details['quantity']
            ];
        }

        // Simpan pesanan ke database dengan status 'pending'
        $order = Order::create([
            'order_id'      => 'CBB-' . uniqid(),
            'store_id'      => $selectedStore['id'],
            'customer_name' => $customerName,
            'total_price'   => $totalPrice,
            'status'        => 'pending',
        ]);

        // Simpan setiap item di keranjang ke tabel 'order_items'
        foreach ($cart as $id => $details) {
            $order->items()->create([
                'product_id'    => $details['product_id'],
                'quantity'      => $details['quantity'],
                'price'         => $details['price'],
                'customizations' => $details['customizations'],
            ]);
        }

        // Konfigurasi Midtrans
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;

        // Siapkan semua parameter untuk dikirim ke Midtrans
        $params = [
            'transaction_details' => [
                'order_id' => $order->order_id,
                'gross_amount' => $order->total_price,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name . ' (' . $selectedStore['name'] . ')',
                'address' => $selectedStore['name'],
            ],
            'item_details' => $item_details,
        ];

        try {
            // Dapatkan Snap Token dan kirim ke frontend
            $snapToken = Snap::getSnapToken($params);
            return response()->json(['snap_token' => $snapToken]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Menerima notifikasi dari Midtrans (Webhook).
     */
    public function webhook(Request $request)
    {
        // Konfigurasi server key
        Config::$serverKey = config('services.midtrans.server_key');

        try {
            $notification = new Notification();

            $transactionStatus = $notification->transaction_status;
            $orderId = $notification->order_id;

            // Cari pesanan di database beserta relasinya
            $order = Order::with('items.product.parent', 'store')->where('order_id', $orderId)->first();

            // Jika pembayaran berhasil (settlement atau capture)
            if (($transactionStatus == 'settlement' || $transactionStatus == 'capture') && $order && $order->status == 'pending') {
                // Update status pesanan menjadi 'success'
                $order->update(['status' => 'success']);

                // Kirim email notifikasi dengan data pesanan yang lengkap
                Mail::to('ezhar.hannafhan05@gmail.com')->send(new NewOrderNotification($order));

                // Kosongkan keranjang setelah pembayaran berhasil
                session()->forget('cart');
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            // Catat error ke log untuk debugging
            \Log::error('Midtrans Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook Error'], 500);
        }
    }
}
