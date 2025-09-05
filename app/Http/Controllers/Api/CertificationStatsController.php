<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\UserCertification;
use App\Models\UserCertificationAttempt;
use App\Models\Certification;
use Carbon\Carbon;

class CertificationStatsController extends Controller
{
    public function getUserStats(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Estadísticas básicas del usuario
        $userStats = UserCertification::getUserStats($user);
        
        // Actividad reciente
        $recentActivity = $this->getRecentActivity($user);
        
        // Certificaciones recomendadas
        $recommended = $this->getRecommended($user);
        
        // Examen en progreso
        $currentExam = $this->getCurrentExam($user);

        return response()->json([
            'total_certificates' => $userStats['total_certificates'],
            'active_certificates' => $userStats['active_certificates'],
            'expired_certificates' => $userStats['expired_certificates'],
            'expiring_soon' => $userStats['expiring_soon'],
            'average_score' => $userStats['average_score'] ?? 0,
            'highest_score' => $userStats['highest_score'] ?? 0,
            'categories_covered' => $userStats['categories_covered'],
            'recent_activity' => $recentActivity,
            'recommended' => $recommended,
            'current_exam' => $currentExam,
        ]);
    }

    private function getRecentActivity($user): array
    {
        $attempts = UserCertificationAttempt::where('user_id', $user->id)
            ->with('certification')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $certificates = UserCertification::where('user_id', $user->id)
            ->with('certification')
            ->orderBy('issued_at', 'desc')
            ->take(3)
            ->get();

        $activity = [];

        // Agregar certificados obtenidos
        foreach ($certificates as $cert) {
            $activity[] = [
                'certification' => $cert->certification->name,
                'type' => 'earned',
                'date' => $cert->issued_at->diffForHumans(),
                'score' => $cert->score,
            ];
        }

        // Agregar intentos recientes
        foreach ($attempts as $attempt) {
            if ($attempt->status === 'completed') {
                $passed = $attempt->score >= $attempt->certification->passing_score;
                $activity[] = [
                    'certification' => $attempt->certification->name,
                    'type' => $passed ? 'earned' : 'failed',
                    'date' => $attempt->completed_at ? $attempt->completed_at->diffForHumans() : $attempt->created_at->diffForHumans(),
                    'score' => $attempt->score,
                ];
            } elseif ($attempt->status === 'in_progress') {
                $activity[] = [
                    'certification' => $attempt->certification->name,
                    'type' => 'in_progress',
                    'date' => $attempt->created_at->diffForHumans(),
                ];
            }
        }

        // Ordenar por fecha y tomar los más recientes
        usort($activity, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return array_slice($activity, 0, 5);
    }

    private function getRecommended($user): array
    {
        // Obtener certificaciones recomendadas basadas en el perfil del usuario
        $userCertifications = UserCertification::where('user_id', $user->id)
            ->pluck('certification_id')
            ->toArray();

        $recommended = Certification::active()
            ->whereNotIn('id', $userCertifications)
            ->withCount('successfulCertifications')
            ->orderByDesc('successful_certifications_count')
            ->take(5)
            ->get()
            ->map(function ($cert) {
                return [
                    'id' => $cert->id,
                    'name' => $cert->name,
                    'category' => $cert->category_label,
                    'level' => $cert->level_label,
                    'popularity' => $cert->successful_certifications_count,
                ];
            });

        return $recommended->toArray();
    }

    private function getCurrentExam($user): ?array
    {
        $currentAttempt = UserCertificationAttempt::where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->with('certification')
            ->first();

        if (!$currentAttempt) {
            return null;
        }

        // Calcular tiempo restante (asumiendo 3 horas por examen)
        $timeLimit = 3 * 60; // 3 horas en minutos
        $timeElapsed = $currentAttempt->started_at->diffInMinutes(now());
        $timeRemaining = max(0, $timeLimit - $timeElapsed);

        // Calcular progreso basado en respuestas
        $answers = $currentAttempt->answers ?? [];
        $totalQuestions = 50; // Esto debería venir de la estructura del examen
        $progress = count($answers) > 0 ? (count($answers) / $totalQuestions) * 100 : 0;

        return [
            'certification' => $currentAttempt->certification->name,
            'time_remaining' => $timeRemaining,
            'progress' => round($progress, 1),
        ];
    }

    public function getGlobalStats(): JsonResponse
    {
        // Estadísticas globales para administradores
        $stats = [
            'total_certifications' => Certification::active()->count(),
            'total_attempts' => UserCertificationAttempt::count(),
            'total_certificates_issued' => UserCertification::where('is_verified', true)->count(),
            'average_pass_rate' => $this->calculateGlobalPassRate(),
            'popular_categories' => $this->getPopularCategories(),
            'recent_activity_count' => UserCertificationAttempt::where('created_at', '>', Carbon::now()->subDays(7))->count(),
        ];

        return response()->json($stats);
    }

    private function calculateGlobalPassRate(): float
    {
        $totalCompleted = UserCertificationAttempt::where('status', 'completed')->count();
        if ($totalCompleted === 0) return 0;

        $totalPassed = UserCertificationAttempt::whereHas('certificate', function($query) {
            $query->where('is_verified', true);
        })->count();

        return round(($totalPassed / $totalCompleted) * 100, 2);
    }

    private function getPopularCategories(): array
    {
        return Certification::active()
            ->selectRaw('category, category_label, COUNT(*) as count')
            ->groupBy('category', 'category_label')
            ->orderByDesc('count')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'label' => $item->category_label,
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }
}