<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewOrderNotification;
use App\Mail\PaymentStatusNotification;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;
use App\Models\Option;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Proses checkout, simpan order ke database, generate Snap Token Midtrans
     */
    public function process(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
        ]);

        $cart = session()->get('cart', []);
        $selectedStore = session()->get('selected_store');

        if (empty($cart) || !$selectedStore) {
            return response()->json(['error' => 'Data tidak lengkap. Harap pilih toko dan item.'], 400);
        }

        $defaultOptions = Option::where('price', 0)->pluck('name')->toArray();

        $totalPrice = 0;
        $item_details = [];
        foreach ($cart as $id => $details) {
            $totalPrice += $details['price'] * $details['quantity'];
            $itemName = $details['name'];
            $nonDefaultCustomizations = array_diff($details['customizations'] ?? [], $defaultOptions);
            if (!empty($nonDefaultCustomizations)) {
                $itemName .= ' (' . implode(', ', $nonDefaultCustomizations) . ')';
            }
            $itemName = substr($itemName, 0, 50);
            $item_details[] = [
                'id'       => $id,
                'name'     => $itemName,
                'price'    => (int) $details['price'],
                'quantity' => (int) $details['quantity']
            ];
        }

        // Buat order_id unik (bukan primary key id, ini yang dikirim ke Midtrans)
        $order_id = 'CBB-' . uniqid();

        $order = Order::create([
            'order_id'      => $order_id,
            'store_id'      => $selectedStore['id'],
            'customer_name' => $request->customer_name,
            'email'         => $request->customer_email,
            'total_price'   => $totalPrice,
            'status'        => 'pending',
        ]);

        foreach ($cart as $id => $details) {
            $order->items()->create([
                'product_id'   => $details['product_id'],
                'quantity'     => $details['quantity'],
                'price'        => $details['price'],
                'customizations' => $details['customizations'],
            ]);
        }

        // Kirim notifikasi pesanan ke pelanggan + BCC ke admin
        Mail::to($order->email)
            ->bcc('ezhar.hannafhan05@gmail.com')
            ->send(new NewOrderNotification($order));

        // Set konfigurasi Midtrans dari config/midtrans.php
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_id,
                'gross_amount' => $order->total_price,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name,
                'email' => $order->email,
                'phone' => '-',
                'billing_address' => [
                    'address' => $selectedStore['name']
                ]
            ],
            'item_details' => $item_details,
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            session()->forget('cart'); 
            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $order->order_id // bisa dipakai buat frontend cek status pembayaran
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint webhook Midtrans (notification handler)
     * Midtrans akan POST ke sini setiap status pembayaran berubah
     */
    public function notification(Request $request)
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');

        try {
            $notif = new Notification();

            // INI WAJIB: cari berdasarkan kolom order_id di tabel, BUKAN id (primary key)
            $order = Order::where('order_id', $notif->order_id)->first();

            if (!$order) {
                Log::error('Order tidak ditemukan.', ['order_id' => $notif->order_id]);
                return response()->json(['error' => 'Order not found.'], 404);
            }

            switch ($notif->transaction_status) {
                case 'capture':
                case 'settlement':
                    $order->status = 'paid';
                    $status_text = 'LUNAS / BERHASIL';
                    break;
                case 'pending':
                    $order->status = 'pending';
                    $status_text = 'MENUNGGU PEMBAYARAN';
                    break;
                case 'deny':
                case 'expire':
                case 'cancel':
                    $order->status = 'failed';
                    $status_text = 'GAGAL / DIBATALKAN';
                    break;
                default:
                    $status_text = ucfirst($notif->transaction_status);
            }
            $order->payment_type = $notif->payment_type ?? null;
            $order->save();

            // Kirim notifikasi status pembayaran ke pelanggan + BCC admin
            Mail::to($order->email)
                ->bcc('ezhar.hannafhan05@gmail.com')
                ->send(new PaymentStatusNotification($order, $status_text));

            return response()->json(['message' => 'Notification handled']);
        } catch (\Exception $e) {
            Log::error('Midtrans Notification Error', ['msg' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint Snap Token ulang (untuk pembayaran order yang sudah ada)
     * Biasanya dipakai jika ingin retry pembayaran di frontend
     */
    public function getSnapToken(Order $order)
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_id,
                'gross_amount' => $order->total_price,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name,
                'email' => $order->email,
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        return response()->json(['snap_token' => $snapToken]);
    }
}
