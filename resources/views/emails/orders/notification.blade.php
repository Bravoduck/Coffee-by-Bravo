<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Pesanan Coffee by Bravo</title>
</head>
<body style="margin:0; padding:0; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; background-color:#f4f4f7;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:24px auto; background-color:#fff; border-radius:12px; box-shadow:0 4px 16px rgba(44,62,80,0.13);">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(90deg, #006442 0%, #2c3e50 100%); padding: 32px 20px; border-top-left-radius:12px; border-top-right-radius:12px;">
                <h1 style="margin:0; font-size:30px; font-weight:700; color:#fff; letter-spacing:1px;">Pesanan Anda Sudah Diterima!</h1>
                <p style="color:#e0f7fa; font-size:15px; margin:12px 0 0 0;">Coffee by Bravo</p>
            </td>
        </tr>
        <!-- Konten -->
        <tr>
            <td style="padding:36px 40px 24px 40px;">
                <p style="font-size:16px; color:#222; margin:0 0 6px 0;">
                    Halo <strong>{{ ucwords(strtolower($order->customer_name ?? 'Pelanggan')) }}</strong>,
                </p>
                <p style="font-size:15px; color:#333; margin:0 0 18px 0;">
                    Terima kasih telah memesan di <b>Coffee by Bravo</b>.<br>
                    Pesanan Anda sedang kami proses. Berikut detail lengkap pesanan Anda:
                </p>
                <!-- Detail Order -->
                <table cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0 24px 0; background:#f6faf7; border-radius:8px;">
                    <tr>
                        <td style="padding:10px 0 10px 20px; font-size:15px; color:#666;">Order ID</td>
                        <td align="right" style="padding:10px 20px 10px 0; font-size:15px; font-weight:bold; color:#195b38;">#{{ $order->order_id ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td style="padding:0 0 10px 20px; font-size:15px; color:#666;">Lokasi Pick Up</td>
                        <td align="right" style="padding:0 20px 10px 0; font-size:15px; font-weight:bold; color:#195b38;">
                            {{ optional($order->store)->name ?? '-' }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 0 10px 20px; font-size:15px; color:#666;">Nama Pemesan</td>
                        <td align="right" style="padding:0 20px 10px 0; font-size:15px; font-weight:bold; color:#195b38;">
                            {{ $order->customer_name ?? '-' }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 0 10px 20px; font-size:15px; color:#666;">Email</td>
                        <td align="right" style="padding:0 20px 10px 0; font-size:15px; font-weight:bold; color:#195b38; text-decoration:none !important; font-family:inherit !important;">
                        <span style="color:#195b38 !important; text-decoration:none !important;">{{ $order->email ?? '-' }}</span>
                        </td>
                    </tr>
                </table>

                <h3 style="font-size:20px; color:#006442; border-bottom:2px solid #e5e5e5; margin:28px 0 18px 0; padding-bottom:8px;">Rincian Item Pesanan</h3>
                @php
                    $wa_lines = [];
                @endphp
                @foreach($order->items as $item)
                    @php
                        // --- Fallback Aman: ---
                        // Nama produk dari relasi, atau langsung dari $item, atau 'Tanpa Nama'
                        $productName = null;
                        if(isset($item->product) && !empty($item->product)) {
                            // Jika relasi product ada, ambil nama parent jika ada, jika tidak ambil nama produk
                            if(isset($item->product->parent) && !empty($item->product->parent) && !empty($item->product->parent->name)) {
                                $productName = $item->product->parent->name;
                            } elseif(!empty($item->product->name)) {
                                $productName = $item->product->name;
                            }
                        }
                        // Jika masih kosong, cek apakah $item ada field name (hardcoded)
                        if(empty($productName) && !empty($item->name)) {
                            $productName = $item->name;
                        }
                        if(empty($productName)) {
                            $productName = 'Tanpa Nama Produk';
                        }
                        $qty = $item->quantity ?? 1;

                        // Gambar produk: relasi -> gambar sendiri -> fallback CDN
                        $imgUrl = null;
                        if(isset($item->product) && !empty($item->product->image)) {
                            $imgUrl = filter_var($item->product->image, FILTER_VALIDATE_URL)
                                ? $item->product->image
                                : url('storage/' . $item->product->image);
                        }
                        // Bisa juga: gambar dari $item langsung
                        if(empty($imgUrl) && !empty($item->image)) {
                            $imgUrl = filter_var($item->image, FILTER_VALIDATE_URL)
                                ? $item->image
                                : url('storage/' . $item->image);
                        }
                        // Default CDN jika tidak ada apapun
                        if(empty($imgUrl)) {
                            $imgUrl = 'https://placehold.co/100x100/eee/ccc?text=Bravo';
                        }

                        // Customizations/opsi menu tambahan:
                        $custom = '';
                        if(isset($item->customizations)) {
                            if(is_array($item->customizations) && count($item->customizations)) {
                                $custom = implode(', ', $item->customizations);
                            } elseif(is_string($item->customizations) && !empty($item->customizations)) {
                                $custom = $item->customizations;
                            }
                        }

                        // Untuk WhatsApp line
                        $wa_line = $productName . " (x" . $qty . ")";
                        if ($custom) $wa_line .= " [{$custom}]";
                        $wa_line .= " - Rp" . number_format(($item->price ?? 0) * $qty, 0, ',', '.');
                        $wa_lines[] = $wa_line;
                    @endphp
                    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:18px;">
                        <tr>
                            <td width="68" valign="top">
                                <img src="{{ $imgUrl }}" alt="Gambar Produk" style="width:58px; height:58px; border-radius:8px; object-fit:cover; border:1.5px solid #d9e2df;">
                            </td>
                            <td valign="top" style="padding-left:18px;">
                                <div style="font-size:16px; font-weight:bold; color:#222;">{{ $productName }} <span style="color:#888;">(x{{ $qty }})</span></div>
                                @if(!empty($custom))
                                    <div style="margin:6px 0 0 0; font-size:13px; color:#5c5c5c;">{{ $custom }}</div>
                                @endif
                            </td>
                            <td align="right" valign="top" style="font-size:16px; font-weight:500; color:#195b38; white-space:nowrap;">
                                Rp {{ number_format(($item->price ?? 0) * $qty, 0, ',', '.') }}
                            </td>
                        </tr>
                    </table>
                @endforeach

                <!-- Total -->
                <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px; border-top:2px solid #006442;">
                    <tr>
                        <td style="font-size:18px; font-weight:bold; color:#006442; padding-top:15px;">Total Pembayaran</td>
                        <td align="right" style="font-size:20px; font-weight:bold; color:#006442; padding-top:15px;">
                            Rp {{ number_format($order->total_price ?? 0, 0, ',', '.') }}
                        </td>
                    </tr>
                </table>

                <!-- WhatsApp Button -->
                @php
                    $wa_message =
                        "*Konfirmasi Pesanan Coffee by Bravo*\n".
                        "Nama: " . ($order->customer_name ?? '-') . "\n" .
                        "Email: " . ($order->email ?? '-') . "\n" .
                        "Order ID: " . ($order->order_id ?? '-') . "\n" .
                        "Lokasi Pick Up: " . (optional($order->store)->name ?? '-') . "\n".
                        "-----------------------------\n".
                        implode("\n", $wa_lines) . "\n" .
                        "-----------------------------\n" .
                        "Total: Rp " . number_format($order->total_price ?? 0, 0, ',', '.') . "\n\n" .
                        "Saya ingin konfirmasi pesanan ini";
                    $wa_link = 'https://wa.me/6281290493785?text=' . urlencode($wa_message);
                @endphp

                <div style="margin:40px 0 0 0; text-align:center;">
                    <a href="{{ $wa_link }}" style="display:inline-block; padding:15px 45px; background:#25d366; color:#fff; font-size:19px; border-radius:7px; text-decoration:none; font-weight:700; box-shadow:0 2px 8px rgba(44,62,80,0.11);">
                        Konfirmasi via WhatsApp
                    </a>
                    <p style="font-size:13px; color:#888; margin-top:8px;">*Klik tombol untuk konfirmasi pesanan ke WhatsApp kami.</p>
                </div>
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td align="center" style="padding:24px; font-size:12px; color:#888; background-color:#f4f4f7; border-bottom-left-radius:12px; border-bottom-right-radius:12px;">
                <p style="margin:0;">&copy; {{ date('Y') }} Coffee by Bravo.</p>
            </td>
        </tr>
    </table>
</body>
</html>
