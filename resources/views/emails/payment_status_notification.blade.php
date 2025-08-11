<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pembayaran Pesanan Coffee by Bravo</title>
</head>
<body>
    <h2>Status Pembayaran: {{ $status_text }}</h2>
    <p>Halo {{ $order->customer_name }},</p>
    <p>Status pembayaran untuk pesanan dengan Order ID <strong>{{ $order->order_id }}</strong> kini: <strong>{{ $status_text }}</strong>.</p>
    <ul>
        <li>Total: Rp{{ number_format($order->total_price, 0, ',', '.') }}</li>
        <li>Email: {{ $order->email }}</li>
    </ul>
    <p>Terima kasih telah memesan di Coffee by Bravo!</p>
</body>
</html>
