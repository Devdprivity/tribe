import React from 'react';
import PostCard from './post-card';

// Datos de demostración para los diferentes tipos de posts
const demoPosts = [
    {
        id: 1,
        content: "¡Hola! Este es un post de texto normal para mostrar la funcionalidad básica.",
        type: 'text' as const,
        likes_count: 15,
        fire_count: 3,
        idea_count: 2,
        bug_count: 0,
        sparkle_count: 1,
        comments_count: 5,
        shares_count: 2,
        views_count: 45,
        is_pinned: false,
        is_bookmarked: false,
        created_at: '2024-01-15T10:30:00Z',
        user: {
            id: 1,
            username: 'dev_example',
            full_name: 'Developer Example',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
            level: 'senior' as const,
            is_open_to_work: true
        },
        hashtags: ['demo', 'texto', 'ejemplo']
    },
    {
        id: 2,
        content: "Un snippet útil para validar emails en JavaScript",
        type: 'code_snippet' as const,
        likes_count: 28,
        fire_count: 12,
        idea_count: 5,
        bug_count: 1,
        sparkle_count: 8,
        comments_count: 12,
        shares_count: 7,
        views_count: 156,
        is_pinned: false,
        is_bookmarked: true,
        created_at: '2024-01-15T09:15:00Z',
        user: {
            id: 2,
            username: 'js_master',
            full_name: 'JavaScript Master',
            avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
            level: 'senior' as const,
            is_open_to_work: false
        },
        hashtags: ['javascript', 'validation', 'email'],
        specialized_data: {
            title: 'Validación de Email',
            description: 'Función simple y efectiva para validar direcciones de email usando regex',
            code: `function validateEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
}

// Ejemplo de uso
console.log(validateEmail('user@example.com')); // true
console.log(validateEmail('invalid-email')); // false`,
            language: 'javascript',
            githubUrl: 'https://github.com/js_master/email-validator',
            isExecutable: true
        }
    },
    {
        id: 3,
        content: "Mi último proyecto: Una aplicación de gestión de tareas",
        type: 'project_showcase' as const,
        likes_count: 45,
        fire_count: 18,
        idea_count: 7,
        bug_count: 2,
        sparkle_count: 15,
        comments_count: 23,
        shares_count: 12,
        views_count: 234,
        is_pinned: true,
        is_bookmarked: false,
        created_at: '2024-01-15T08:45:00Z',
        user: {
            id: 3,
            username: 'react_dev',
            full_name: 'React Developer',
            avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
            level: 'mid' as const,
            is_open_to_work: true
        },
        hashtags: ['react', 'typescript', 'project'],
        specialized_data: {
            title: 'TaskFlow - Gestión de Tareas',
            description: 'Una aplicación moderna de gestión de tareas construida con React, TypeScript y Tailwind CSS. Incluye drag & drop, filtros avanzados y sincronización en tiempo real.',
            image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
            technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB'],
            githubUrl: 'https://github.com/react_dev/taskflow',
            liveUrl: 'https://taskflow-demo.vercel.app',
            stats: {
                stars: 42,
                forks: 8,
                watchers: 12
            },
            features: [
                'Drag & Drop para reorganizar tareas',
                'Filtros por estado, prioridad y fecha',
                'Sincronización en tiempo real',
                'Temas claro y oscuro',
                'Responsive design'
            ]
        }
    },
    {
        id: 4,
        content: "Tutorial completo sobre cómo implementar autenticación JWT en Laravel",
        type: 'tech_tutorial' as const,
        likes_count: 67,
        fire_count: 25,
        idea_count: 12,
        bug_count: 3,
        sparkle_count: 20,
        comments_count: 34,
        shares_count: 18,
        views_count: 456,
        is_pinned: false,
        is_bookmarked: true,
        created_at: '2024-01-15T07:20:00Z',
        user: {
            id: 4,
            username: 'laravel_guru',
            full_name: 'Laravel Guru',
            avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
            level: 'senior' as const,
            is_open_to_work: false
        },
        hashtags: ['laravel', 'jwt', 'authentication', 'tutorial'],
        specialized_data: {
            title: 'Autenticación JWT en Laravel 10',
            content: 'En este tutorial aprenderás a implementar autenticación JWT completa en Laravel 10, incluyendo registro, login, refresh tokens y middleware de protección.',
            readTime: 12,
            difficulty: 'intermediate' as const,
            tags: ['laravel', 'jwt', 'authentication', 'api'],
            sections: [
                {
                    title: 'Instalación y Configuración',
                    content: 'Primero necesitamos instalar el paquete JWT para Laravel y configurar nuestras variables de entorno.',
                    code: 'composer require tymon/jwt-auth',
                    language: 'bash'
                },
                {
                    title: 'Configuración del Modelo User',
                    content: 'Actualizamos nuestro modelo User para implementar la interfaz JWTSubject.',
                    code: `use Tymon\\JWTAuth\\Contracts\\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}`,
                    language: 'php'
                }
            ],
            images: [
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop'
            ]
        }
    },
    {
        id: 5,
        content: "Solución a un problema común con CORS en APIs",
        type: 'problem_solution' as const,
        likes_count: 89,
        fire_count: 35,
        idea_count: 15,
        bug_count: 5,
        sparkle_count: 28,
        comments_count: 45,
        shares_count: 22,
        views_count: 567,
        is_pinned: false,
        is_bookmarked: true,
        created_at: '2024-01-15T06:30:00Z',
        user: {
            id: 5,
            username: 'api_expert',
            full_name: 'API Expert',
            avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
            level: 'senior' as const,
            is_open_to_work: false
        },
        hashtags: ['cors', 'api', 'javascript', 'solution'],
        specialized_data: {
            problem: {
                title: 'Error CORS en peticiones desde el frontend',
                description: 'Estoy intentando hacer peticiones desde mi aplicación React a mi API Laravel, pero estoy recibiendo errores de CORS. El navegador bloquea las peticiones.',
                context: 'Tengo una aplicación React corriendo en localhost:3000 y una API Laravel en localhost:8000. Las peticiones funcionan en Postman pero no en el navegador.',
                error: 'Access to fetch at \'http://localhost:8000/api/users\' from origin \'http://localhost:3000\' has been blocked by CORS policy: No \'Access-Control-Allow-Origin\' header is present on the requested resource.',
                code: `fetch('http://localhost:8000/api/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
                language: 'javascript'
            },
            solution: {
                description: 'El problema es que Laravel no está configurado para permitir peticiones CORS desde tu frontend. Necesitas configurar los headers CORS correctamente.',
                explanation: 'Laravel incluye un middleware CORS que puedes configurar para permitir peticiones desde dominios específicos. También puedes usar el paquete fruitcake/laravel-cors para mayor control.',
                code: `// En config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];`,
                language: 'php',
                alternatives: [
                    'Usar el paquete fruitcake/laravel-cors para mayor flexibilidad',
                    'Configurar un proxy en tu aplicación React para desarrollo',
                    'Usar Laravel Sanctum para autenticación SPA'
                ]
            },
            tags: ['cors', 'laravel', 'react', 'api'],
            difficulty: 'easy' as const,
            category: 'Backend'
        }
    },
    {
        id: 6,
        content: "Playground interactivo para aprender algoritmos de ordenamiento",
        type: 'code_playground' as const,
        likes_count: 52,
        fire_count: 22,
        idea_count: 8,
        bug_count: 1,
        sparkle_count: 18,
        comments_count: 19,
        shares_count: 11,
        views_count: 298,
        is_pinned: false,
        is_bookmarked: false,
        created_at: '2024-01-15T05:15:00Z',
        user: {
            id: 6,
            username: 'algo_teacher',
            full_name: 'Algorithm Teacher',
            avatar: 'https://avatars.githubusercontent.com/u/6?v=4',
            level: 'senior' as const,
            is_open_to_work: false
        },
        hashtags: ['algorithms', 'sorting', 'javascript', 'learning'],
        specialized_data: {
            title: 'Bubble Sort Interactivo',
            description: 'Aprende cómo funciona el algoritmo Bubble Sort ejecutando el código paso a paso. Modifica los números y ve cómo cambia el comportamiento.',
            language: 'javascript',
            initialCode: `// Array de números para ordenar
const numbers = [64, 34, 25, 12, 22, 11, 90];

function bubbleSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Intercambiar elementos
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    
    return arr;
}

// Ejecutar el algoritmo
console.log('Array original:', numbers);
const sorted = bubbleSort([...numbers]);
console.log('Array ordenado:', sorted);`,
            expectedOutput: `Array original: [64, 34, 25, 12, 22, 11, 90]
Array ordenado: [11, 12, 22, 25, 34, 64, 90]`,
            isInteractive: true
        }
    }
];

interface DemoPostsProps {
    currentUser: any;
}

export default function DemoPosts({ currentUser }: DemoPostsProps) {
    return (
        <div className="space-y-6">
            {demoPosts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                />
            ))}
        </div>
    );
}
