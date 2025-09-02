<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Channel;
use App\Models\User;
use Illuminate\Support\Str;

class ChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $channels = [
            [
                'name' => 'Laravel',
                'description' => 'Comunidad de desarrolladores Laravel',
                'type' => 'technology',
                'is_private' => false,
            ],
            [
                'name' => 'React',
                'description' => 'Desarrolladores React y React Native',
                'type' => 'technology',
                'is_private' => false,
            ],
            [
                'name' => 'JavaScript',
                'description' => 'Todo sobre JavaScript y ECMAScript',
                'type' => 'technology',
                'is_private' => false,
            ],
            [
                'name' => 'Vue.js',
                'description' => 'Comunidad Vue.js',
                'type' => 'technology',
                'is_private' => false,
            ],
            [
                'name' => 'Python',
                'description' => 'Desarrolladores Python',
                'type' => 'technology',
                'is_private' => false,
            ],
            [
                'name' => 'Frontend',
                'description' => 'Desarrollo frontend y UI/UX',
                'type' => 'industry',
                'is_private' => false,
            ],
            [
                'name' => 'Backend',
                'description' => 'Desarrollo backend y APIs',
                'type' => 'industry',
                'is_private' => false,
            ],
            [
                'name' => 'DevOps',
                'description' => 'DevOps y infraestructura',
                'type' => 'industry',
                'is_private' => false,
            ],
            [
                'name' => 'Principiante',
                'description' => 'Para desarrolladores que están empezando',
                'type' => 'level',
                'is_private' => false,
            ],
            [
                'name' => 'Experto',
                'description' => 'Para desarrolladores experimentados',
                'type' => 'level',
                'is_private' => false,
            ],
        ];

        foreach ($channels as $channelData) {
            $channel = Channel::create([
                'name' => $channelData['name'],
                'slug' => Str::slug($channelData['name']),
                'description' => $channelData['description'],
                'type' => $channelData['type'],
                'is_private' => $channelData['is_private'],
                'created_by' => User::first()?->id ?? 1,
                'members_count' => rand(10, 100),
            ]);

            // Agregar algunos usuarios como miembros (si existen)
            $users = User::take(rand(3, 8))->get();
            foreach ($users as $user) {
                $channel->addMember($user, 'member');
            }
        }
    }
}
