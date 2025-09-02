<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios existentes
        $users = User::all();
        
        if ($users->count() < 2) {
            $this->command->warn('Se necesitan al menos 2 usuarios para crear posts de prueba');
            return;
        }

        $posts = [
            [
                'user_id' => $users->first()->id,
                'content' => 'Acabo de terminar mi proyecto de React con TypeScript y estoy muy emocionado de compartirlo con la comunidad. Utilicé las mejores prácticas y patrones modernos. ¿Qué opinan? #React #TypeScript #Frontend',
                'type' => 'project',
                'code_language' => 'typescript',
                'media_urls' => ['/img/Theme/4k-resolution-5f0ynl6oa2mijckl.webp'],
            ],
            [
                'user_id' => $users->skip(1)->first()->id,
                'content' => '¿Alguien más está experimentando con Laravel 11? Los nuevos features son increíbles, especialmente el sistema de testing mejorado. Compartan sus experiencias. #Laravel #PHP #Backend',
                'type' => 'text',
            ],
            [
                'user_id' => $users->first()->id,
                'content' => 'Acabo de publicar un tutorial sobre optimización de performance en Node.js. Incluye técnicas avanzadas y mejores prácticas. ¡Espero que les sea útil! #NodeJS #Performance #Tutorial',
                'type' => 'code',
                'code_language' => 'javascript',
            ],
            [
                'user_id' => $users->skip(1)->first()->id,
                'content' => 'Compartiendo mi experiencia con Docker y Kubernetes. La containerización ha revolucionado mi workflow de desarrollo. ¿Cuáles son sus mejores prácticas? #Docker #Kubernetes #DevOps',
                'type' => 'text',
            ],
            [
                'user_id' => $users->first()->id,
                'content' => 'Nuevo proyecto en Vue 3 con Composition API. La experiencia de desarrollo es increíble. Aquí está el código principal:',
                'type' => 'code',
                'code_language' => 'vue',
            ],
        ];

        foreach ($posts as $postData) {
            Post::create($postData);
        }

        $this->command->info('Posts de prueba creados exitosamente');
    }
}
