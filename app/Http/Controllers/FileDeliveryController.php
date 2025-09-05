<?php

namespace App\Http\Controllers;

use App\Models\MarketplacePurchase;
use App\Services\FileDeliveryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class FileDeliveryController extends Controller
{
    public function __construct(
        private FileDeliveryService $deliveryService
    ) {}

    /**
     * Descargar archivo usando token seguro (OPTIMIZADO para Octane)
     */
    public function download(Request $request, string $token)
    {
        try {
            if (!Auth::check()) {
                return redirect()->route('login')
                               ->withErrors(['error' => 'Debes iniciar sesión para descargar']);
            }

            // Obtener archivo usando el servicio
            $result = $this->deliveryService->downloadFile($token, Auth::id());

            // Manejar diferentes tipos de respuesta
            switch ($result['type']) {
                case 'redirect':
                    return redirect($result['url']);

                case 'download':
                    return Response::download(
                        $result['path'],
                        $result['name'],
                        ['Content-Type' => $result['mime_type']]
                    );

                case 'instructions':
                    return Inertia::render('Marketplace/Download/Instructions', [
                        'data' => $result['data'],
                        'token' => $token
                    ]);

                default:
                    throw new \Exception('Tipo de respuesta no soportado');
            }

        } catch (\Exception $e) {
            Log::error('File download failed', [
                'token' => $token,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return redirect()->route('marketplace.purchases')
                           ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Mostrar información de descarga
     */
    public function downloadInfo(string $token)
    {
        try {
            if (!Auth::check()) {
                return redirect()->route('login');
            }

            $purchase = MarketplacePurchase::where('download_token', $token)
                                          ->where('buyer_id', Auth::id())
                                          ->with(['product', 'seller'])
                                          ->first();

            if (!$purchase) {
                return redirect()->route('marketplace.purchases')
                               ->withErrors(['error' => 'Token de descarga inválido']);
            }

            $deliveryData = $purchase->delivery_data ?? [];

            return Inertia::render('Marketplace/Download/Info', [
                'purchase' => $purchase,
                'delivery_data' => $deliveryData,
                'download_url' => route('marketplace.download', ['token' => $token]),
                'can_download' => $purchase->can_download,
                'download_stats' => [
                    'attempts' => $purchase->download_attempts,
                    'max_attempts' => $deliveryData['download_limits']['max_attempts'] ?? 5,
                    'first_download' => $purchase->first_download_at,
                    'last_download' => $purchase->last_download_at,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Download info failed', [
                'token' => $token,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Error al cargar información de descarga']);
        }
    }

    /**
     * Subir archivos para producto (vendedor)
     */
    public function uploadFiles(Request $request, int $productId)
    {
        try {
            // Verificar que el usuario sea el propietario del producto
            $product = \App\Models\MarketplaceProduct::where('id', $productId)
                                                    ->where('seller_id', Auth::id())
                                                    ->firstOrFail();

            $validated = $request->validate([
                'files' => 'required|array|max:20',
                'files.*' => 'file|max:51200', // 50MB por archivo
                'overwrite' => 'boolean',
            ]);

            $uploadedFiles = [];
            $uploadPath = "marketplace/uploads/{$productId}";

            foreach ($request->file('files') as $file) {
                // Validar tipo de archivo
                if (!$this->isAllowedFileType($file)) {
                    throw new \Exception("Tipo de archivo no permitido: {$file->getClientOriginalName()}");
                }

                $fileName = $file->getClientOriginalName();
                $filePath = "{$uploadPath}/{$fileName}";

                // Verificar si existe y no se permite sobrescribir
                if (!($validated['overwrite'] ?? false) && 
                    \Illuminate\Support\Facades\Storage::disk('private')->exists($filePath)) {
                    throw new \Exception("El archivo {$fileName} ya existe");
                }

                // Subir archivo
                $path = $file->storeAs($uploadPath, $fileName, 'private');
                
                $uploadedFiles[] = [
                    'name' => $fileName,
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }

            return response()->json([
                'success' => true,
                'uploaded_files' => $uploadedFiles,
                'message' => 'Archivos subidos exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('File upload failed', [
                'product_id' => $productId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Listar archivos de un producto (vendedor)
     */
    public function listFiles(int $productId)
    {
        try {
            // Verificar permisos
            $product = \App\Models\MarketplaceProduct::where('id', $productId)
                                                    ->where('seller_id', Auth::id())
                                                    ->firstOrFail();

            $uploadPath = "marketplace/uploads/{$productId}";
            $files = [];

            if (\Illuminate\Support\Facades\Storage::disk('private')->exists($uploadPath)) {
                $allFiles = \Illuminate\Support\Facades\Storage::disk('private')->allFiles($uploadPath);
                
                foreach ($allFiles as $filePath) {
                    $files[] = [
                        'name' => basename($filePath),
                        'path' => $filePath,
                        'size' => \Illuminate\Support\Facades\Storage::disk('private')->size($filePath),
                        'size_formatted' => $this->formatBytes(
                            \Illuminate\Support\Facades\Storage::disk('private')->size($filePath)
                        ),
                        'last_modified' => \Illuminate\Support\Facades\Storage::disk('private')->lastModified($filePath),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'files' => $files,
                'total_files' => count($files),
                'total_size' => array_sum(array_column($files, 'size')),
            ]);

        } catch (\Exception $e) {
            Log::error('File listing failed', [
                'product_id' => $productId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al listar archivos'
            ], 500);
        }
    }

    /**
     * Eliminar archivo de producto (vendedor)
     */
    public function deleteFile(Request $request, int $productId, string $fileName)
    {
        try {
            // Verificar permisos
            $product = \App\Models\MarketplaceProduct::where('id', $productId)
                                                    ->where('seller_id', Auth::id())
                                                    ->firstOrFail();

            $filePath = "marketplace/uploads/{$productId}/{$fileName}";

            if (!\Illuminate\Support\Facades\Storage::disk('private')->exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Archivo no encontrado'
                ], 404);
            }

            // Eliminar archivo
            \Illuminate\Support\Facades\Storage::disk('private')->delete($filePath);

            return response()->json([
                'success' => true,
                'message' => 'Archivo eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('File deletion failed', [
                'product_id' => $productId,
                'file_name' => $fileName,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar archivo'
            ], 500);
        }
    }

    // Private helper methods

    private function isAllowedFileType(\Illuminate\Http\UploadedFile $file): bool
    {
        $allowedTypes = [
            // Code files
            'php', 'js', 'ts', 'jsx', 'tsx', 'vue', 'html', 'css', 'scss', 'sass',
            'json', 'xml', 'yaml', 'yml', 'sql', 'py', 'java', 'cs', 'cpp', 'c',
            // Documents
            'txt', 'md', 'pdf', 'doc', 'docx',
            // Archives
            'zip', 'rar', '7z', 'tar', 'gz',
            // Images
            'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
            // Config files
            'env', 'ini', 'conf', 'config',
        ];

        $extension = strtolower($file->getClientOriginalExtension());
        return in_array($extension, $allowedTypes);
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
