@php
    $cart = $cart ?? session('cart', []);
    $totalItems = 0;
    $totalPrice = 0;

    if ($cart) {
        foreach ($cart as $id => $details) {
            $totalItems += $details['quantity'];
            $totalPrice += $details['price'] * $details['quantity'];
        }
    }
@endphp

@if($totalItems > 0)
    <a href="{{ route('checkout.index') }}" class="cart-footer">
        <div class="cart-summary">
            <span>Cek Keranjang ({{ $totalItems }} produk)</span>
        </div>
        <div class="cart-total">
            <span>Rp {{ number_format($totalPrice, 0, ',', '.') }}</span>
        </div>
    </a>
@endif