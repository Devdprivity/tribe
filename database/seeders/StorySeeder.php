<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Story;
use App\Models\User;

class StorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::take(5)->get();

        if ($users->isEmpty()) {
            $this->command->info('No hay usuarios disponibles para crear historias');
            return;
        }

        $sampleImages = [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop',
        ];

        $sampleCaptions = [
            '¡Coding session! 💻',
            'Beautiful sunset today 🌅',
            'New project in progress 🚀',
            'Coffee break ☕',
            'Weekend vibes 🎉',
            'Learning new tech stack 📚',
            'Team meeting was great! 👥',
            'Just deployed to production 🎯',
        ];

        foreach ($users as $user) {
            // Crear 1-3 historias por usuario
            $storyCount = rand(1, 3);
            
            for ($i = 0; $i < $storyCount; $i++) {
                Story::create([
                    'user_id' => $user->id,
                    'media_url' => $sampleImages[array_rand($sampleImages)],
                    'media_type' => 'image',
                    'caption' => $sampleCaptions[array_rand($sampleCaptions)],
                    'expires_at' => now()->addHours(rand(1, 24)), // Entre 1 y 24 horas
                ]);
            }
        }

        $this->command->info('Historias de prueba creadas exitosamente');
    }
}