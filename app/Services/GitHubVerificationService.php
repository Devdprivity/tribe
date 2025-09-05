<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GitHubVerificationService
{
    private string $githubApiUrl = 'https://api.github.com';
    private ?string $githubToken;

    public function __construct()
    {
        $this->githubToken = config('services.github.verification_token');
    }

    /**
     * Verificar si un repositorio GitHub existe y es accesible
     */
    public function verifyRepository(string $repoPath): array
    {
        // Cache key para evitar múltiples requests a GitHub
        $cacheKey = "github_verify:" . str_replace('/', '_', $repoPath);
        
        // Intentar obtener del cache (válido por 1 hora)
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = $this->makeGitHubRequest("/repos/{$repoPath}");
            
            if ($response['success']) {
                $repoData = $response['data'];
                
                $result = [
                    'exists' => true,
                    'is_public' => !$repoData['private'],
                    'is_fork' => $repoData['fork'],
                    'has_commits' => $repoData['size'] > 0,
                    'language' => $repoData['language'],
                    'languages' => $this->getRepositoryLanguages($repoPath),
                    'last_updated' => $repoData['updated_at'],
                    'stars' => $repoData['stargazers_count'],
                    'forks' => $repoData['forks_count'],
                    'verified_at' => now()->toISOString(),
                    'repo_data' => [
                        'name' => $repoData['name'],
                        'description' => $repoData['description'],
                        'homepage' => $repoData['homepage'],
                        'topics' => $repoData['topics'] ?? [],
                        'license' => $repoData['license']['name'] ?? null,
                        'default_branch' => $repoData['default_branch'],
                    ]
                ];
            } else {
                $result = [
                    'exists' => false,
                    'error' => $response['error'] ?? 'Repository not found or private',
                    'verified_at' => now()->toISOString(),
                ];
            }

            // Cachear el resultado por 1 hora
            Cache::put($cacheKey, $result, 3600);
            
            return $result;

        } catch (\Exception $e) {
            Log::error('GitHub verification failed', [
                'repo' => $repoPath,
                'error' => $e->getMessage()
            ]);

            $result = [
                'exists' => false,
                'error' => 'Verification failed: ' . $e->getMessage(),
                'verified_at' => now()->toISOString(),
            ];

            // Cachear error por 30 minutos
            Cache::put($cacheKey, $result, 1800);
            
            return $result;
        }
    }

    /**
     * Obtener los lenguajes de programación de un repositorio
     */
    public function getRepositoryLanguages(string $repoPath): array
    {
        try {
            $response = $this->makeGitHubRequest("/repos/{$repoPath}/languages");
            
            if ($response['success']) {
                $languages = $response['data'];
                
                // Calcular porcentajes
                $total = array_sum($languages);
                $languagePercentages = [];
                
                foreach ($languages as $language => $bytes) {
                    $percentage = $total > 0 ? round(($bytes / $total) * 100, 1) : 0;
                    $languagePercentages[$language] = $percentage;
                }
                
                // Ordenar por porcentaje descendente
                arsort($languagePercentages);
                
                return $languagePercentages;
            }

            return [];

        } catch (\Exception $e) {
            Log::error('Failed to get repository languages', [
                'repo' => $repoPath,
                'error' => $e->getMessage()
            ]);
            
            return [];
        }
    }

    /**
     * Verificar si el usuario es el propietario del repositorio
     */
    public function verifyOwnership(string $repoPath, string $githubUsername): bool
    {
        try {
            // Extraer el owner del repo path
            $pathParts = explode('/', $repoPath);
            if (count($pathParts) !== 2) {
                return false;
            }

            [$repoOwner, $repoName] = $pathParts;
            
            // Verificar que el username coincida con el owner
            return strtolower($repoOwner) === strtolower($githubUsername);

        } catch (\Exception $e) {
            Log::error('GitHub ownership verification failed', [
                'repo' => $repoPath,
                'username' => $githubUsername,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Obtener información de commits recientes del repositorio
     */
    public function getRecentCommits(string $repoPath, int $count = 5): array
    {
        try {
            $response = $this->makeGitHubRequest("/repos/{$repoPath}/commits", [
                'per_page' => $count,
                'page' => 1
            ]);

            if ($response['success']) {
                $commits = array_map(function ($commit) {
                    return [
                        'sha' => substr($commit['sha'], 0, 7),
                        'message' => $commit['commit']['message'],
                        'author' => $commit['commit']['author']['name'],
                        'date' => $commit['commit']['author']['date'],
                        'url' => $commit['html_url']
                    ];
                }, $response['data']);

                return $commits;
            }

            return [];

        } catch (\Exception $e) {
            Log::error('Failed to get recent commits', [
                'repo' => $repoPath,
                'error' => $e->getMessage()
            ]);
            
            return [];
        }
    }

    /**
     * Verificar si un repositorio tiene archivos típicos de proyecto
     */
    public function hasProjectFiles(string $repoPath): array
    {
        $filesToCheck = [
            'README.md', 'README.rst', 'README.txt',
            'package.json', 'composer.json', 'requirements.txt',
            'Dockerfile', 'docker-compose.yml',
            '.gitignore', 'LICENSE', 'LICENSE.md'
        ];

        $foundFiles = [];

        foreach ($filesToCheck as $fileName) {
            try {
                $response = $this->makeGitHubRequest("/repos/{$repoPath}/contents/{$fileName}");
                if ($response['success']) {
                    $foundFiles[] = $fileName;
                }
            } catch (\Exception $e) {
                // File doesn't exist, continue
                continue;
            }
        }

        return [
            'has_readme' => !empty(array_filter($foundFiles, fn($f) => str_starts_with($f, 'README'))),
            'has_package_config' => in_array('package.json', $foundFiles) || in_array('composer.json', $foundFiles),
            'has_docker' => in_array('Dockerfile', $foundFiles) || in_array('docker-compose.yml', $foundFiles),
            'has_license' => !empty(array_filter($foundFiles, fn($f) => str_starts_with($f, 'LICENSE'))),
            'has_gitignore' => in_array('.gitignore', $foundFiles),
            'found_files' => $foundFiles,
            'completeness_score' => count($foundFiles) / count($filesToCheck) * 100
        ];
    }

    /**
     * Hacer una petición a la API de GitHub
     */
    private function makeGitHubRequest(string $endpoint, array $params = []): array
    {
        $url = $this->githubApiUrl . $endpoint;
        
        $headers = [
            'Accept' => 'application/vnd.github.v3+json',
            'User-Agent' => 'TribeMarketplace/1.0'
        ];

        // Agregar token de autenticación si está disponible
        if ($this->githubToken) {
            $headers['Authorization'] = "token {$this->githubToken}";
        }

        $response = Http::withHeaders($headers)
                       ->timeout(30)
                       ->get($url, $params);

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json(),
                'rate_limit' => [
                    'remaining' => $response->header('X-RateLimit-Remaining'),
                    'reset' => $response->header('X-RateLimit-Reset')
                ]
            ];
        }

        return [
            'success' => false,
            'error' => $response->reason(),
            'status_code' => $response->status(),
            'rate_limit' => [
                'remaining' => $response->header('X-RateLimit-Remaining'),
                'reset' => $response->header('X-RateLimit-Reset')
            ]
        ];
    }

    /**
     * Limpiar cache de verificación para un repositorio
     */
    public function clearVerificationCache(string $repoPath): void
    {
        $cacheKey = "github_verify:" . str_replace('/', '_', $repoPath);
        Cache::forget($cacheKey);
    }

    /**
     * Obtener información de rate limit actual
     */
    public function getRateLimitInfo(): array
    {
        try {
            $response = $this->makeGitHubRequest('/rate_limit');
            
            if ($response['success']) {
                return $response['data']['rate'];
            }

            return [
                'limit' => 60, // Default for unauthenticated
                'remaining' => 0,
                'reset' => time() + 3600
            ];

        } catch (\Exception $e) {
            return [
                'limit' => 60,
                'remaining' => 0,
                'reset' => time() + 3600,
                'error' => $e->getMessage()
            ];
        }
    }
}