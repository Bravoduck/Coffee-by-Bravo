<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    /**
     * Menampilkan halaman daftar semua store.
     */
    public function index(Request $request)
    {
        $stores = Store::all();
        
        // Simpan URL referrer ke session jika ada
        if ($request->has('from')) {
            session()->put('store_redirect_url', $request->get('from'));
        } elseif (!session()->has('store_redirect_url')) {
            // Jika tidak ada parameter 'from', gunakan URL sebelumnya
            session()->put('store_redirect_url', url()->previous());
        }
        
        return view('stores', ['stores' => $stores]);
    }

    /**
     * Menyimpan store yang dipilih ke dalam session.
     */
    public function select(Store $store)
    {
        // Simpan seluruh data store yang dipilih ke dalam session
        session()->put('selected_store', [
            'id' => $store->id,
            'name' => $store->name,
        ]);

        // Ambil URL redirect dari session
        $redirectUrl = session()->pull('store_redirect_url', route('checkout.index'));
        
        return redirect($redirectUrl);
    }
}
