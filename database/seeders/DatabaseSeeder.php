<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Channel;
use App\Models\Post;
use App\Models\Job;
use App\Models\Comment;
use App\Models\PostLike;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Crear usuarios de prueba
        $users = [
            [
                'username' => 'johndoe',
                'full_name' => 'John Doe',
                'email' => 'john@tribe.dev',
                'password' => bcrypt('password'),
                'bio' => 'Senior Full Stack Developer con 8 años de experiencia. Especializado en Laravel, Vue.js y React.',
                'level' => 'senior',
                'years_experience' => 8,
                'location' => 'Madrid, España',
                'github_username' => 'johndoe',
                'is_open_to_work' => false,
                'email_verified_at' => now(),
            ],
            [
                'username' => 'janesmith',
                'full_name' => 'Jane Smith',
                'email' => 'jane@tribe.dev',
                'password' => bcrypt('password'),
                'bio' => 'Frontend Developer apasionada por React y diseño UX/UI.',
                'level' => 'mid',
                'years_experience' => 4,
                'location' => 'Barcelona, España',
                'github_username' => 'janesmith',
                'is_open_to_work' => true,
                'email_verified_at' => now(),
            ],
            [
                'username' => 'alexdev',
                'full_name' => 'Alex García',
                'email' => 'alex@tribe.dev',
                'password' => bcrypt('password'),
                'bio' => 'Junior Developer empezando mi carrera en el mundo del desarrollo web.',
                'level' => 'junior',
                'years_experience' => 1,
                'location' => 'Valencia, España',
                'github_username' => 'alexdev',
                'is_open_to_work' => true,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        // Crear canales de prueba
        $channels = [
            [
                'name' => 'Laravel España',
                'slug' => 'laravel-espana',
                'description' => 'Comunidad de desarrolladores Laravel en España',
                'type' => 'technology',
                'created_by' => 1,
                'is_private' => false,
            ],
            [
                'name' => 'Frontend Developers',
                'slug' => 'frontend-developers',
                'description' => 'Todo sobre desarrollo frontend: React, Vue, Angular y más',
                'type' => 'technology',
                'created_by' => 2,
                'is_private' => false,
            ],
            [
                'name' => 'Junior Developers',
                'slug' => 'junior-developers',
                'description' => 'Espacio para desarrolladores junior para aprender y crecer',
                'type' => 'level',
                'created_by' => 3,
                'is_private' => false,
            ],
        ];

        foreach ($channels as $channelData) {
            $channel = Channel::create($channelData);
            // Agregar el creador como admin
            $channel->addMember(User::find($channelData['created_by']), 'admin');
        }

        // Crear posts de prueba
        $posts = [
            [
                'user_id' => 1,
                'content' => '¡Acabo de lanzar mi nueva aplicación con Laravel 12! 🚀 Ha sido un viaje increíble aprendiendo todas las nuevas características.',
                'type' => 'text',
            ],
            [
                'user_id' => 2,
                'content' => 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
                'type' => 'code',
                'code_language' => 'javascript',
            ],
            [
                'user_id' => 3,
                'content' => '¿Algún consejo para un junior que está empezando con Git? Me cuesta entender los merges y conflicts 😅',
                'type' => 'text',
            ],
            [
                'user_id' => 1,
                'content' => 'Comparando frameworks de CSS: ¿Tailwind CSS vs Bootstrap vs CSS puro? ¿Cuál prefieren y por qué?',
                'type' => 'text',
            ],
        ];

        foreach ($posts as $postData) {
            Post::create($postData);
        }

        // Crear trabajos de prueba
        $jobs = [
            [
                'company_name' => 'TechStart',
                'title' => 'Senior Laravel Developer',
                'description' => 'Buscamos un desarrollador Laravel senior para unirse a nuestro equipo. Experiencia con Vue.js es un plus.',
                'requirements' => ['Laravel 9+', 'Vue.js', 'MySQL', 'Git', '5+ años experiencia'],
                'salary_range' => '45.000€ - 55.000€',
                'location' => 'Madrid',
                'remote_friendly' => true,
                'posted_by' => 2,
            ],
            [
                'company_name' => 'DigitalAgency',
                'title' => 'Frontend Developer',
                'description' => 'Únete a nuestro equipo de frontend para crear interfaces increíbles con React y Next.js.',
                'requirements' => ['React', 'Next.js', 'TypeScript', 'CSS/SASS'],
                'salary_range' => '35.000€ - 42.000€',
                'location' => 'Barcelona',
                'remote_friendly' => false,
                'posted_by' => 1,
            ],
        ];

        foreach ($jobs as $jobData) {
            Job::create($jobData);
        }

        // Crear comentarios de prueba
        $comments = [
            [
                'user_id' => 2,
                'post_id' => 1,
                'content' => '¡Felicidades! ¿Qué características de Laravel 12 te gustaron más?',
            ],
            [
                'user_id' => 3,
                'post_id' => 1,
                'content' => 'Increíble trabajo 👏',
            ],
            [
                'user_id' => 1,
                'post_id' => 3,
                'content' => 'Mi consejo: practica con repositorios pequeños primero y no tengas miedo de usar la documentación de Git. ¡Todos hemos estado ahí!',
            ],
        ];

        foreach ($comments as $commentData) {
            Comment::create($commentData);
        }

        // Crear likes de prueba
        $likes = [
            ['user_id' => 2, 'post_id' => 1, 'type' => 'fire'],
            ['user_id' => 3, 'post_id' => 1, 'type' => 'like'],
            ['user_id' => 1, 'post_id' => 2, 'type' => 'idea'],
            ['user_id' => 2, 'post_id' => 4, 'type' => 'like'],
        ];

        foreach ($likes as $likeData) {
            PostLike::create($likeData);
        }

        // Crear relaciones de seguimiento
        $user1 = User::find(1);
        $user2 = User::find(2);
        $user3 = User::find(3);

        $user1->following()->attach([2, 3]);
        $user2->following()->attach([1, 3]);
        $user3->following()->attach([1, 2]);

        // Agregar usuarios a canales
        $laravel = Channel::find(1);
        $frontend = Channel::find(2);
        $junior = Channel::find(3);

        $laravel->addMember($user2, 'member');
        $laravel->addMember($user3, 'member');

        $frontend->addMember($user1, 'member');
        $frontend->addMember($user3, 'member');

        $junior->addMember($user1, 'moderator');
        $junior->addMember($user2, 'member');

        $this->command->info('Base de datos sembrada con datos de prueba para Tribe!');
    }
}
