<?php

namespace App\Services;

use App\Models\MarketplaceProduct;
use App\Models\MarketplacePurchase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\File;
use ZipArchive;

class FileDeliveryService
{
    private GitHubVerificationService $githubService;
    private NotificationService $notificationService;

    public function __construct(
        GitHubVerificationService $githubService,
        NotificationService $notificationService
    ) {
        $this->githubService = $githubService;
        $this->notificationService = $notificationService;
    }

    /**
     * Preparar entrega de archivo después de compra exitosa (OPTIMIZADO)
     */
    public function prepareDelivery(MarketplacePurchase $purchase): array
    {
        try {
            $product = $purchase->product;
            $deliveryToken = $this->generateSecureToken();

            // Preparar según método de entrega
            $deliveryData = match($product->delivery_method) {
                'github_release' => $this->prepareGitHubRelease($product, $deliveryToken),
                'zip_file' => $this->prepareZipFile($product, $deliveryToken),
                'git_access' => $this->prepareGitAccess($product, $deliveryToken),
                default => throw new \Exception('Método de entrega no soportado: ' . $product->delivery_method)
            };

            // Actualizar compra con información de entrega
            $purchase->update([
                'delivery_status' => 'delivered',
                'delivered_at' => now(),
                'delivery_data' => $deliveryData,
                'download_token' => $deliveryToken,
            ]);

            // Notificar al comprador
            $this->notificationService->productDelivered($purchase->buyer, $purchase);

            return [
                'success' => true,
                'delivery_data' => $deliveryData,
                'download_token' => $deliveryToken,
            ];

        } catch (\Exception $e) {
            Log::error('File delivery preparation failed', [
                'purchase_id' => $purchase->id,
                'product_id' => $purchase->product_id,
                'error' => $e->getMessage()
            ]);

            // Marcar entrega como fallida
            $purchase->update([
                'delivery_status' => 'failed',
                'delivery_data' => ['error' => $e->getMessage()],
            ]);

            return [
                'success' => false,
                'error' => 'Error al preparar la entrega: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Descargar archivo usando token seguro (OPTIMIZADO para Octane)
     */
    public function downloadFile(string $token, int $userId): mixed
    {
        try {
            // Buscar compra por token
            $purchase = MarketplacePurchase::where('download_token', $token)
                                          ->where('buyer_id', $userId)
                                          ->where('delivery_status', 'delivered')
                                          ->first();

            if (!$purchase) {
                throw new \Exception('Token de descarga inválido o expirado');
            }

            // Verificar límites de descarga
            if (!$this->canDownload($purchase)) {
                throw new \Exception('Límite de descargas excedido');
            }

            // Registrar intento de descarga
            $this->recordDownloadAttempt($purchase);

            // Obtener archivo según método
            $deliveryData = $purchase->delivery_data;
            
            return match($deliveryData['method']) {
                'github_release' => $this->downloadFromGitHub($purchase),
                'zip_file' => $this->downloadZipFile($purchase),
                'git_access' => $this->provideGitAccess($purchase),
                default => throw new \Exception('Método de entrega no soportado')
            };

        } catch (\Exception $e) {
            Log::error('File download failed', [
                'token' => $token,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Preparar entrega desde GitHub Release
     */
    private function prepareGitHubRelease(MarketplaceProduct $product, string $token): array
    {
        if (empty($product->github_repo)) {
            throw new \Exception('No se especificó repositorio GitHub');
        }

        // Verificar que el repositorio existe
        $repoInfo = $this->githubService->verifyRepository($product->github_repo);
        
        if (!$repoInfo['exists']) {
            throw new \Exception('El repositorio GitHub no existe o no es accesible');
        }

        // Obtener información del último release
        $releaseInfo = $this->getLatestRelease($product->github_repo);

        return [
            'method' => 'github_release',
            'repo' => $product->github_repo,
            'repo_url' => "https://github.com/{$product->github_repo}",
            'release_info' => $releaseInfo,
            'download_token' => $token,
            'expires_at' => now()->addDays(30)->toISOString(),
            'download_limits' => [
                'max_attempts' => 10,
                'current_attempts' => 0,
            ],
        ];
    }

    /**
     * Preparar archivo ZIP
     */
    private function prepareZipFile(MarketplaceProduct $product, string $token): array
    {
        $productPath = "marketplace/products/{$product->id}";
        $zipFileName = "{$product->slug}-v" . time() . ".zip";
        $zipPath = "{$productPath}/{$zipFileName}";

        // Verificar si ya existe un ZIP preparado
        if (!Storage::disk('private')->exists($zipPath)) {
            // Si hay GitHub repo, crear ZIP desde ahí
            if (!empty($product->github_repo)) {
                $this->createZipFromGitHub($product, $zipPath);
            } else {
                // Buscar archivos subidos manualmente
                $this->createZipFromUploads($product, $zipPath);
            }
        }

        // Verificar tamaño del archivo
        $fileSize = Storage::disk('private')->size($zipPath);

        return [
            'method' => 'zip_file',
            'file_path' => $zipPath,
            'file_name' => $zipFileName,
            'file_size' => $fileSize,
            'file_size_formatted' => $this->formatBytes($fileSize),
            'download_token' => $token,
            'download_url' => route('marketplace.download', ['token' => $token]),
            'expires_at' => now()->addDays(30)->toISOString(),
            'download_limits' => [
                'max_attempts' => 5,
                'current_attempts' => 0,
            ],
        ];
    }

    /**
     * Preparar acceso Git temporal
     */
    private function prepareGitAccess(MarketplaceProduct $product, string $token): array
    {
        if (empty($product->github_repo)) {
            throw new \Exception('No se especificó repositorio GitHub');
        }

        // Por seguridad, este método solo proporciona instrucciones
        // En un entorno real, se podría crear un token de acceso temporal
        
        return [
            'method' => 'git_access',
            'repo' => $product->github_repo,
            'repo_url' => "https://github.com/{$product->github_repo}",
            'clone_command' => "git clone https://github.com/{$product->github_repo}.git",
            'instructions' => [
                '1. Copia el comando de clonado',
                '2. Ejecuta en tu terminal',
                '3. El código estará disponible localmente',
                '4. Este acceso es válido por 30 días'
            ],
            'download_token' => $token,
            'expires_at' => now()->addDays(30)->toISOString(),
            'download_limits' => [
                'max_attempts' => 3,
                'current_attempts' => 0,
            ],
        ];
    }

    /**
     * Descargar desde GitHub
     */
    private function downloadFromGitHub(MarketplacePurchase $purchase): array
    {
        $deliveryData = $purchase->delivery_data;
        $repoUrl = $deliveryData['repo_url'];

        // Si hay release específico, usar ese
        if (isset($deliveryData['release_info']['download_url'])) {
            return [
                'type' => 'redirect',
                'url' => $deliveryData['release_info']['download_url']
            ];
        }

        // Fallback a ZIP del repo principal
        $zipUrl = "{$repoUrl}/archive/refs/heads/main.zip";
        
        return [
            'type' => 'redirect',
            'url' => $zipUrl
        ];
    }

    /**
     * Descargar archivo ZIP
     */
    private function downloadZipFile(MarketplacePurchase $purchase): array
    {
        $deliveryData = $purchase->delivery_data;
        $filePath = $deliveryData['file_path'];

        if (!Storage::disk('private')->exists($filePath)) {
            throw new \Exception('El archivo ya no está disponible');
        }

        $fullPath = Storage::disk('private')->path($filePath);

        return [
            'type' => 'download',
            'path' => $fullPath,
            'name' => $deliveryData['file_name'],
            'mime_type' => 'application/zip'
        ];
    }

    /**
     * Proporcionar acceso Git
     */
    private function provideGitAccess(MarketplacePurchase $purchase): array
    {
        $deliveryData = $purchase->delivery_data;

        return [
            'type' => 'instructions',
            'data' => [
                'repo_url' => $deliveryData['repo_url'],
                'clone_command' => $deliveryData['clone_command'],
                'instructions' => $deliveryData['instructions']
            ]
        ];
    }

    /**
     * Crear ZIP desde repositorio GitHub
     */
    private function createZipFromGitHub(MarketplaceProduct $product, string $zipPath): void
    {
        try {
            // Descargar ZIP del repositorio
            $repoZipUrl = "https://github.com/{$product->github_repo}/archive/refs/heads/main.zip";
            
            $response = Http::timeout(300)->get($repoZipUrl);
            
            if (!$response->successful()) {
                throw new \Exception('No se pudo descargar el repositorio');
            }

            // Guardar archivo temporalmente
            $tempPath = sys_get_temp_dir() . '/' . uniqid() . '.zip';
            file_put_contents($tempPath, $response->body());

            // Procesar y limpiar el ZIP
            $this->processAndStoreZip($tempPath, $zipPath, $product);

            // Limpiar archivo temporal
            unlink($tempPath);

        } catch (\Exception $e) {
            Log::error('Failed to create ZIP from GitHub', [
                'product_id' => $product->id,
                'repo' => $product->github_repo,
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Error al crear archivo ZIP: ' . $e->getMessage());
        }
    }

    /**
     * Crear ZIP desde archivos subidos
     */
    private function createZipFromUploads(MarketplaceProduct $product, string $zipPath): void
    {
        $uploadsPath = "marketplace/uploads/{$product->id}";
        
        if (!Storage::disk('private')->exists($uploadsPath)) {
            throw new \Exception('No se encontraron archivos para este producto');
        }

        $files = Storage::disk('private')->allFiles($uploadsPath);
        
        if (empty($files)) {
            throw new \Exception('No hay archivos disponibles para descargar');
        }

        // Crear ZIP
        $tempPath = sys_get_temp_dir() . '/' . uniqid() . '.zip';
        $zip = new ZipArchive();
        
        if ($zip->open($tempPath, ZipArchive::CREATE) !== TRUE) {
            throw new \Exception('No se pudo crear el archivo ZIP');
        }

        foreach ($files as $file) {
            $localName = basename($file);
            $fullPath = Storage::disk('private')->path($file);
            $zip->addFile($fullPath, $localName);
        }

        $zip->close();

        // Mover a ubicación final
        Storage::disk('private')->put($zipPath, file_get_contents($tempPath));
        unlink($tempPath);
    }

    /**
     * Procesar y almacenar ZIP
     */
    private function processAndStoreZip(string $sourcePath, string $destPath, MarketplaceProduct $product): void
    {
        $zip = new ZipArchive();
        
        if ($zip->open($sourcePath) !== TRUE) {
            throw new \Exception('No se pudo abrir el archivo ZIP descargado');
        }

        // Crear nuevo ZIP limpio
        $cleanPath = sys_get_temp_dir() . '/' . uniqid() . '.zip';
        $cleanZip = new ZipArchive();
        
        if ($cleanZip->open($cleanPath, ZipArchive::CREATE) !== TRUE) {
            throw new \Exception('No se pudo crear archivo ZIP procesado');
        }

        // Filtrar archivos (evitar archivos del sistema, node_modules, etc.)
        $excludePatterns = [
            '.git/', 'node_modules/', '.env', '.DS_Store', 
            'Thumbs.db', '*.log', '.idea/', '.vscode/'
        ];

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);
            
            // Verificar si debe excluirse
            $exclude = false;
            foreach ($excludePatterns as $pattern) {
                if (fnmatch($pattern, $filename) || str_contains($filename, $pattern)) {
                    $exclude = true;
                    break;
                }
            }

            if (!$exclude && !is_dir($filename)) {
                $content = $zip->getFromIndex($i);
                // Remover prefijo del directorio raíz
                $cleanName = preg_replace('/^[^\/]+\//', '', $filename);
                $cleanZip->addFromString($cleanName, $content);
            }
        }

        $cleanZip->close();
        $zip->close();

        // Guardar archivo final
        Storage::disk('private')->put($destPath, file_get_contents($cleanPath));
        unlink($cleanPath);
    }

    /**
     * Obtener información del último release de GitHub
     */
    private function getLatestRelease(string $repo): array
    {
        try {
            $response = Http::timeout(30)
                          ->withHeaders(['User-Agent' => 'TribeMarketplace/1.0'])
                          ->get("https://api.github.com/repos/{$repo}/releases/latest");

            if (!$response->successful()) {
                return [
                    'exists' => false,
                    'download_url' => "https://github.com/{$repo}/archive/refs/heads/main.zip",
                    'fallback' => true
                ];
            }

            $release = $response->json();

            return [
                'exists' => true,
                'tag_name' => $release['tag_name'],
                'name' => $release['name'],
                'published_at' => $release['published_at'],
                'download_url' => $release['zipball_url'],
                'release_notes' => $release['body'],
            ];

        } catch (\Exception $e) {
            Log::warning('Could not fetch GitHub release', [
                'repo' => $repo,
                'error' => $e->getMessage()
            ]);

            return [
                'exists' => false,
                'download_url' => "https://github.com/{$repo}/archive/refs/heads/main.zip",
                'fallback' => true
            ];
        }
    }

    /**
     * Verificar si se puede descargar
     */
    private function canDownload(MarketplacePurchase $purchase): bool
    {
        $deliveryData = $purchase->delivery_data;
        $limits = $deliveryData['download_limits'] ?? ['max_attempts' => 5, 'current_attempts' => 0];

        // Verificar límite de intentos
        if ($purchase->download_attempts >= $limits['max_attempts']) {
            return false;
        }

        // Verificar expiración
        if (isset($deliveryData['expires_at'])) {
            $expiresAt = \Carbon\Carbon::parse($deliveryData['expires_at']);
            if (now()->isAfter($expiresAt)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Registrar intento de descarga (OPTIMIZADO para Octane)
     */
    private function recordDownloadAttempt(MarketplacePurchase $purchase): void
    {
        // Usar DB increment para evitar retención de modelo en memoria
        MarketplacePurchase::where('id', $purchase->id)->increment('download_attempts');
        
        // Actualizar timestamps
        $updates = ['last_download_at' => now()];
        
        if (is_null($purchase->first_download_at)) {
            $updates['first_download_at'] = now();
        }

        MarketplacePurchase::where('id', $purchase->id)->update($updates);
    }

    /**
     * Generar token seguro
     */
    private function generateSecureToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Formatear bytes en formato legible
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Limpiar archivos temporales y expirados
     */
    public function cleanupExpiredFiles(): int
    {
        $cleanedCount = 0;

        try {
            // Buscar compras con archivos expirados
            $expiredPurchases = MarketplacePurchase::where('delivery_status', 'delivered')
                                                  ->where('delivered_at', '<', now()->subDays(45))
                                                  ->get();

            foreach ($expiredPurchases as $purchase) {
                $deliveryData = $purchase->delivery_data ?? [];
                
                if (isset($deliveryData['file_path']) && $deliveryData['method'] === 'zip_file') {
                    $filePath = $deliveryData['file_path'];
                    
                    if (Storage::disk('private')->exists($filePath)) {
                        Storage::disk('private')->delete($filePath);
                        $cleanedCount++;
                    }
                }
            }

            Log::info('Cleaned up expired marketplace files', [
                'files_cleaned' => $cleanedCount
            ]);

        } catch (\Exception $e) {
            Log::error('File cleanup failed', [
                'error' => $e->getMessage()
            ]);
        }

        return $cleanedCount;
    }

    /**
     * Obtener estadísticas de archivos
     */
    public function getStorageStats(): array
    {
        try {
            $marketplacePath = 'marketplace';
            $totalSize = 0;
            $fileCount = 0;

            if (Storage::disk('private')->exists($marketplacePath)) {
                $files = Storage::disk('private')->allFiles($marketplacePath);
                $fileCount = count($files);
                
                foreach ($files as $file) {
                    $totalSize += Storage::disk('private')->size($file);
                }
            }

            return [
                'total_files' => $fileCount,
                'total_size' => $totalSize,
                'total_size_formatted' => $this->formatBytes($totalSize),
                'disk_usage_percentage' => $this->getDiskUsagePercentage(),
            ];

        } catch (\Exception $e) {
            Log::error('Could not get storage stats', [
                'error' => $e->getMessage()
            ]);

            return [
                'total_files' => 0,
                'total_size' => 0,
                'total_size_formatted' => '0 B',
                'disk_usage_percentage' => 0,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtener porcentaje de uso del disco
     */
    private function getDiskUsagePercentage(): float
    {
        try {
            $path = Storage::disk('private')->path('');
            $free = disk_free_space($path);
            $total = disk_total_space($path);
            
            if ($total > 0) {
                $used = $total - $free;
                return round(($used / $total) * 100, 2);
            }

            return 0;

        } catch (\Exception $e) {
            return 0;
        }
    }
}