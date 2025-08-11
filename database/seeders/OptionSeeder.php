<?php

namespace Database\Seeders;

use App\Models\Option;
use App\Models\OptionGroup;
use Illuminate\Database\Seeder;

class OptionSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            ['id' => 1, 'name' => 'Ukuran Cup', 'type' => 'radio', 'is_required' => true],
            ['id' => 2, 'name' => 'Sweetness', 'type' => 'radio', 'is_required' => true],
            ['id' => 3, 'name' => 'Ice Cube', 'type' => 'radio', 'is_required' => true],
            ['id' => 4, 'name' => 'Espresso', 'type' => 'radio', 'is_required' => true],
            ['id' => 5, 'name' => 'Dairy', 'type' => 'radio', 'is_required' => true],
            ['id' => 6, 'name' => 'Syrup', 'type' => 'checkbox', 'is_required' => false],
            ['id' => 7, 'name' => 'Topping', 'type' => 'checkbox', 'is_required' => false],
            ['id' => 8, 'name' => 'Temperature', 'type' => 'radio', 'is_required' => true],
        ];

        $options = [
            1 => [ // Pilihan untuk 'Ukuran Cup'
                ['name' => 'Regular Ice', 'price' => 0], 
                ['name' => 'Large Ice', 'price' => 4500],
                ['name' => 'Regular Hot', 'price' => 0],
                ['name' => 'Large Hot', 'price' => 4500]
            ],
            2 => [ // Pilihan untuk 'Sweetness'
                ['name' => 'Normal Sweet', 'price' => 0], 
                ['name' => 'Less Sweet', 'price' => 0]
            ],
            3 => [ // Pilihan untuk 'Ice Cube'
                ['name' => 'Normal Ice', 'price' => 0], 
                ['name' => 'Less Ice', 'price' => 0], 
                ['name' => 'More Ice', 'price' => 0],
                ['name' => 'No Ice', 'price' => 0],
                ['name' => 'Ice Separately', 'price' => 0]
            ],
            4 => [ // Pilihan untuk 'Espresso'
                ['name' => 'Normal Shot', 'price' => 0], 
                ['name' => '+1 Shot', 'price' => 4500], 
                ['name' => '+2 Shot', 'price' => 8500], 
                ['name' => '+3 Shot', 'price' => 13000]
            ],
            5 => [ // Pilihan untuk 'Dairy'
                ['name' => 'Milk', 'price' => 0],
                ['name' => 'No Milk', 'price' => 0],
                ['name' => 'Soy Multigrain', 'price' => 4500], 
                ['name' => 'Oat Milk', 'price' => 9000], 
                ['name' => 'Almond Milk', 'price' => 9000],
                ['name' => 'Fresh Milk', 'price' => 4500],
                ['name' => 'UHT Milk', 'price' => 4500]
            ],
            6 => [ // Pilihan untuk 'Syrup'
                ['name' => 'Pecan Praline', 'price' => 4500],
                ['name' => 'Aren', 'price' => 4500], 
                ['name' => 'Hazelnut', 'price' => 4500], 
                ['name' => 'Pandan', 'price' => 4500], 
                ['name' => 'Manuka', 'price' => 4500], 
                ['name' => 'Vanilla', 'price' => 4500], 
                ['name' => 'Salted Caramel', 'price' => 4500]
            ],
            7 => [ // Pilihan untuk 'Topping'
                ['name' => 'Crumble', 'price' => 4500], 
                ['name' => 'Milo Powder', 'price' => 4500], 
                ['name' => 'Caramel Sauce', 'price' => 4500], 
                ['name' => 'Sea Salt Cream', 'price' => 4500], 
                ['name' => 'Oreo Crumbs', 'price' => 4500], 
                ['name' => 'Coffee Cream', 'price' => 4500], 
                ['name' => 'Tiramisu Cream', 'price' => 4500]
            ],
            8 => [ // Pilihan untuk 'Temperature'
                ['name' => 'Hot', 'price' => 0], 
                ['name' => 'Extra Hot', 'price' => 0]
            ],
        ];

        foreach ($groups as $groupData) {
            $group = OptionGroup::updateOrCreate(['id' => $groupData['id']], $groupData);
            if (isset($options[$group->id])) {
                foreach ($options[$group->id] as $optionData) {
                    Option::updateOrCreate(
                        ['option_group_id' => $group->id, 'name' => $optionData['name']],
                        ['price' => $optionData['price']]
                    );
                }
            }
        }
    }
}