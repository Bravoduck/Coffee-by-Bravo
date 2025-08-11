<section class="option-group" id="option-group-{{ $group->id }}">
    <div class="option-group-header">
        <h2>{{ $group->name }}</h2>
        @if($group->name == 'Topping')
            <p>Opsional, Maks 2</p>
        @elseif($group->name == 'Syrup')
            <p>Opsional, Maks 1</p>
        @else
            <p>Wajib, Pilih 1</p>
        @endif
    </div>

    @php
        $isFirstVisibleOption = true;

        // === LOGIKA BARU: DAPATKAN DAFTAR PILIHAN YANG DIIZINKAN DARI RESEP ===
        $allowedOptionNames = [];
        // Pastikan $productConfig ada dan memiliki options_config
        if (isset($productConfig, $productConfig->options_config) && property_exists($productConfig->options_config, $group->name)) {
            $allowedOptionNames = $productConfig->options_config->{$group->name};
        }
    @endphp

    {{-- Loop semua pilihan dari "Gudang" (database) --}}
    @foreach ($group->options as $option)

        {{-- === FILTER BARU: Tampilkan hanya jika nama opsi ada di dalam "resep" === --}}
        @if(in_array($option->name, $allowedOptionNames))
            @php
                // Logika ini tetap ada jika Anda punya varian Iced/Hot
                $isIcedOption = Str::contains($option->name, 'Ice');
                $isHotOption = Str::contains($option->name, 'Hot');
                $isGeneralOption = !$isIcedOption && !$isHotOption;
                $shouldShow = ($variantName == 'Iced' && ($isIcedOption || $isGeneralOption)) ||
                              ($variantName == 'Hot' && ($isHotOption || $isGeneralOption));
            @endphp

            @if($shouldShow)
                <div class="option-item">
                    <label>
                        <span class="option-name">{{ $option->name }}</span>
                        @if($option->price > 0)
                            <span class="option-price">+Rp {{ number_format($option->price, 0, ',', '.') }}</span>
                        @endif
                        <input 
                            type="{{ $group->type }}"
                            name="customizations[{{ $group->id }}]{{ $group->type === 'checkbox' ? '[]' : '' }}"
                            value="{{ $option->name }}"
                            data-price="{{ $option->price }}"
                            @if($isFirstVisibleOption && $group->is_required)
                                checked
                                @php $isFirstVisibleOption = false; @endphp
                            @endif
                        >
                        <span class="custom-{{ $group->type }}"></span>
                    </label>
                </div>
            @endif
        @endif
    @endforeach
</section>