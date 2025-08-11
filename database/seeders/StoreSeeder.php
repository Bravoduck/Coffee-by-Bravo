<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Store;
use Illuminate\Support\Facades\File;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan file stores.json ada
        if (!File::exists(database_path('data/stores.json'))) {
            $this->command->error("File stores.json tidak ditemukan!");
            return;
        }

        $json = File::get(database_path('data/stores.json'));
        $stores = json_decode($json);

        // Loop setiap data store dan masukkan ke database
        foreach ($stores as $storeData) {
            Store::create([
                'name' => $storeData->name,
                'address' => $storeData->address,
                'hours' => $storeData->hours,
                'services' => implode(', ', $storeData->services)
            ]);
        }
    }
}