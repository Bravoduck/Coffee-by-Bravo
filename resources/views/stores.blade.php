@extends('layouts.app')

@section('content')
<div class="mobile-container">
    <header class="detail-header store-header">
        <div class="header-col left">
            <a href="{{ url()->previous() }}" class="back-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"></path>
                </svg>
            </a>
        </div>
        <div class="header-col center">
            <h1 class="header-title">Fore Store</h1>
            <input type="search" id="store-search-input" placeholder="" class="search-input" style="display:none;" />
        </div>
        <div class="header-col right">
            <button class="icon-button" id="header-search-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
                    <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path>
                </svg>
            </button>
        </div>
    </header>
    <main class="store-list-main">
        <section class="pickup-info-card">
            <div class="pickup-icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 20H3V11H2V20.5C2 21.3284 2.67157 22 3.5 22H20.5C21.3284 22 22 21.3284 22 20.5V11H21V20ZM12 2C15.3137 2 18 4.68629 18 8C18 12.4183 12 19 12 19C12 19 6 12.4183 6 8C6 4.68629 8.68629 2 12 2ZM12 10.5C13.3807 10.5 14.5 9.38071 14.5 8C14.5 6.61929 13.3807 5.5 12 5.5C10.6193 5.5 9.5 6.61929 9.5 8C9.5 9.38071 10.6193 10.5 12 10.5Z"></path>
                </svg>
            </div>
            <div>
                <h3>Pick Up</h3>
                <p>Ambil ke store tanpa antri</p>
            </div>
        </section>
        <p class="store-count">{{ count($stores) }} Store tersedia</p>
        <div class="store-list">
            @forelse ($stores as $store)
            <a href="{{ route('stores.select', $store->id) }}" class="store-card">
                <div class="store-details">
                    <h3 class="store-name">{{ $store->name }}</h3>
                    <p class="store-address">{{ $store->address }}</p>
                    <div class="store-hours open">Buka {{ $store->hours }}</div>
                </div>
                <div class="store-amenities">
                    <svg class="go-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                    </svg>
                </div>
            </a>
            @empty
            <p>Tidak ada store yang ditemukan.</p>
            @endforelse
        </div>
    </main>
</div>
@endsection

@push('scripts')
@vite('resources/js/store.js')
@endpush