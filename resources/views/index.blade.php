@extends('layouts.app')

@section('content')
<div class="mobile-container">
    <div class="sticky-header">
        <header class="app-header">
            <a href="#" class="back-btn" id="back-from-search" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"></path>
                </svg>
            </a>

            <a href="{{ route('stores.index') }}" class="location-picker-link">
                <div class="location-picker">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.2929 3.29289C16.0739 2.51184 17.34 2.51184 18.121 3.29289L19.707 4.87868C20.4881 5.65973 20.4881 6.92606 19.707 7.70711L10.4141 17H7V13.5858L15.2929 3.29289ZM16 5.41421L8 13.4142V16H10.5858L18.5858 8.00005L16 5.41421Z"></path>
                        <path d="M16 5.41421L18.5858 8.00005L17.2929 9.29294L14.7071 6.70716L16 5.41421Z"></path>
                        <path d="M5 20H19V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V20Z"></path>
                    </svg>
                    <div>
                        <span class="pickup-label">Pick up di store</span>
                        <span class="location-name">{{ session('selected_store.name') ?? 'Pilih store' }}</span>
                    </div>
                </div>
            </a>

            <input type="search" id="product-search-input" class="search-input-main" placeholder="">

            <div class="header-icons">
                <button class="icon-button" id="search-icon-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
                        <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path>
                    </svg>
                </button>
            </div>
        </header>
        <div class="filter-wrapper">
            <div class="filters">
                @foreach ($categories as $category)
                @if(count($category->products) > 0)
                <button class="filter-btn {{ $loop->first ? 'active' : '' }}" data-filter="{{ $category->slug }}">
                    {{ $category->name }}
                </button>
                @endif
                @endforeach
            </div>
        </div>
    </div>

    <main id="product-list-container">
        @foreach ($categories as $category)
        @if(count($category->products) > 0)
        <section id="{{ $category->slug }}" class="product-section">
            <div class="product-list-header">
                <h2>{{ $category->name }}</h2>
                <span>{{ $category->products->count() }} items</span>
            </div>
            <div class="product-list">
                @foreach ($category->products as $product)
                <article class="product-card" data-product-id="{{ $product->id }}" data-product-name="{{ $product->name }}">
                    <img src="{{ asset($product->image) }}" alt="{{ $product->name }}" class="product-image" />
                    <div class="product-details">
                        <h3>{{ $product->name }}</h3>
                        <p class="product-description">{{ $product->description }}</p>
                        <div class="product-price-wrapper">
                            <p class="product-price">Rp {{ number_format($product->price, 0, ',', '.') }}</p>
                            @if($product->is_sold_out)
                            <p class="sold-out-label">Habis Terjual</p>
                            @endif
                        </div>
                    </div>
                    <div class="product-actions">
                        <a href="{{ route('product.show', $product->slug) }}" class="action-btn add-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
                            </svg>
                        </a>
                    </div>
                </article>
                @endforeach
            </div>
        </section>
        @endif
        @endforeach
        <div id="no-results-message" class="empty-cart-msg" style="display: none; padding: 40px 16px;">
            <h3>Menu Tidak Ditemukan</h3>
            <p>Coba gunakan kata kunci lain untuk menemukan menu favoritmu.</p>
        </div>
    </main>

    <div id="cart-footer-container">
        @include('partials.cart-footer')
    </div>
</div>
@endsection

@push('scripts')
@vite('resources/js/app.js')
@endpush