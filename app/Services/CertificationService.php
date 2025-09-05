<?php

namespace App\Services;

use App\Models\Certification;
use App\Models\User;
use App\Models\UserCertificationAttempt;
use App\Models\UserCertification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificationService
{
    public function canUserStartExam(User $user, Certification $certification): bool
    {
        // Check if user already has this certification
        if ($this->hasUserPassed($user, $certification)) {
            return false;
        }

        // Check attempts limit
        $attemptsUsed = $certification->attempts()
            ->where('user_id', $user->id)
            ->count();

        if ($attemptsUsed >= $certification->max_attempts) {
            return false;
        }

        // Check if there's an active attempt
        $activeAttempt = $certification->attempts()
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->exists();

        return !$activeAttempt;
    }

    public function hasUserPassed(User $user, Certification $certification): bool
    {
        return UserCertification::where('user_id', $user->id)
            ->where('certification_id', $certification->id)
            ->where('is_verified', true)
            ->exists();
    }

    public function startExam(User $user, Certification $certification): UserCertificationAttempt
    {
        if (!$this->canUserStartExam($user, $certification)) {
            throw new \Exception('No puedes iniciar este examen en este momento.');
        }

        $attemptNumber = $certification->attempts()
            ->where('user_id', $user->id)
            ->count() + 1;

        return UserCertificationAttempt::create([
            'user_id' => $user->id,
            'certification_id' => $certification->id,
            'attempt_number' => $attemptNumber,
            'status' => 'in_progress',
            'started_at' => now(),
            'answers' => [],
            'time_spent' => [],
        ]);
    }

    public function isAttemptValid(UserCertificationAttempt $attempt): bool
    {
        if ($attempt->status !== 'in_progress') {
            return false;
        }

        // Check if exam has expired (e.g., 3 hours max)
        $maxDurationHours = 3;
        if ($attempt->started_at->addHours($maxDurationHours)->isPast()) {
            $attempt->update(['status' => 'expired']);
            return false;
        }

        return true;
    }

    public function generateExam(Certification $certification, UserCertificationAttempt $attempt): array
    {
        $examStructure = $certification->exam_structure;
        
        // This would typically pull questions from a question bank
        // For this implementation, we'll generate a sample structure
        $sections = [];
        
        foreach ($examStructure as $section) {
            $questions = $this->generateQuestionsForSection($section, $certification);
            
            $sections[] = [
                'id' => Str::uuid(),
                'name' => $section['name'],
                'description' => $section['description'] ?? null,
                'time_limit_minutes' => $section['time_limit'] ?? 60,
                'questions' => $questions,
                'passing_score' => $section['passing_score'] ?? 70,
            ];
        }

        return [
            'sections' => $sections,
            'total_questions' => array_sum(array_column($examStructure, 'question_count')),
            'total_time_minutes' => array_sum(array_column($examStructure, 'time_limit')),
            'instructions' => $this->getExamInstructions($certification),
        ];
    }

    private function generateQuestionsForSection(array $section, Certification $certification): array
    {
        $questions = [];
        $questionCount = $section['question_count'] ?? 10;
        
        // This would typically query a questions database
        // For now, we'll generate sample questions based on skills
        for ($i = 0; $i < $questionCount; $i++) {
            $questions[] = $this->generateSampleQuestion($section, $certification, $i);
        }

        return $questions;
    }

    private function generateSampleQuestion(array $section, Certification $certification, int $index): array
    {
        $types = ['multiple_choice', 'true_false', 'code_completion', 'short_answer'];
        $type = $types[array_rand($types)];

        $baseQuestion = [
            'id' => Str::uuid(),
            'type' => $type,
            'points' => $section['points_per_question'] ?? 1,
            'difficulty' => $certification->level,
        ];

        switch ($type) {
            case 'multiple_choice':
                return array_merge($baseQuestion, [
                    'question' => $this->generateMultipleChoiceQuestion($certification, $index),
                    'options' => $this->generateMultipleChoiceOptions(),
                    'correct_answer' => 'A',
                ]);

            case 'true_false':
                return array_merge($baseQuestion, [
                    'question' => $this->generateTrueFalseQuestion($certification, $index),
                    'correct_answer' => rand(0, 1) ? 'true' : 'false',
                ]);

            case 'code_completion':
                return array_merge($baseQuestion, [
                    'question' => $this->generateCodeCompletionQuestion($certification, $index),
                    'code_template' => $this->generateCodeTemplate(),
                    'expected_output' => 'Sample output',
                ]);

            case 'short_answer':
                return array_merge($baseQuestion, [
                    'question' => $this->generateShortAnswerQuestion($certification, $index),
                    'max_length' => 200,
                    'keywords' => ['sample', 'keywords'],
                ]);

            default:
                return $baseQuestion;
        }
    }

    private function generateMultipleChoiceQuestion(Certification $certification, int $index): string
    {
        $skills = $certification->skills_covered;
        $skill = $skills[array_rand($skills)];
        
        return "¿Cuál de las siguientes afirmaciones sobre {$skill} es correcta?";
    }

    private function generateMultipleChoiceOptions(): array
    {
        return [
            'A' => 'Opción A - Respuesta correcta',
            'B' => 'Opción B - Respuesta incorrecta',
            'C' => 'Opción C - Respuesta incorrecta',
            'D' => 'Opción D - Respuesta incorrecta',
        ];
    }

    private function generateTrueFalseQuestion(Certification $certification, int $index): string
    {
        return "Afirmación sobre " . $certification->skills_covered[0] . " para evaluar conocimiento.";
    }

    private function generateCodeCompletionQuestion(Certification $certification, int $index): string
    {
        return "Complete el siguiente código para implementar la funcionalidad requerida:";
    }

    private function generateCodeTemplate(): string
    {
        return "function example() {\n    // Complete aquí\n    return ___;\n}";
    }

    private function generateShortAnswerQuestion(Certification $certification, int $index): string
    {
        return "Explique brevemente el concepto de " . $certification->skills_covered[0] . " y su importancia.";
    }

    private function getExamInstructions(Certification $certification): array
    {
        return [
            "Este examen evalúa tus conocimientos en {$certification->name}.",
            "Tienes un tiempo límite para completar cada sección.",
            "Lee cuidadosamente cada pregunta antes de responder.",
            "Puedes navegar entre preguntas dentro de cada sección.",
            "Tu progreso se guarda automáticamente.",
            "Una vez completado, no podrás modificar las respuestas.",
        ];
    }

    public function submitAnswer(UserCertificationAttempt $attempt, string $questionId, $answer, int $timeSpent): void
    {
        if (!$this->isAttemptValid($attempt)) {
            throw new \Exception('El intento de examen no es válido.');
        }

        $answers = $attempt->answers ?? [];
        $timeSpentData = $attempt->time_spent ?? [];

        $answers[$questionId] = $answer;
        $timeSpentData[$questionId] = $timeSpent;

        $attempt->update([
            'answers' => $answers,
            'time_spent' => $timeSpentData,
        ]);
    }

    public function completeExam(UserCertificationAttempt $attempt): array
    {
        if (!$this->isAttemptValid($attempt)) {
            throw new \Exception('El intento de examen no es válido.');
        }

        $certification = $attempt->certification;
        $examData = $this->generateExam($certification, $attempt);
        
        // Calculate score
        $results = $this->calculateScore($attempt, $examData);
        
        // Update attempt
        $attempt->update([
            'status' => 'completed',
            'completed_at' => now(),
            'score' => $results['total_score'],
            'section_scores' => $results['section_scores'],
            'total_time_minutes' => $attempt->started_at->diffInMinutes(now()),
            'feedback' => $this->generateFeedback($results, $certification),
        ]);

        // Create certification if passed
        if ($results['total_score'] >= $certification->passing_score) {
            $this->createCertificate($attempt, $results['total_score']);
        }

        return $results;
    }

    private function calculateScore(UserCertificationAttempt $attempt, array $examData): array
    {
        $answers = $attempt->answers ?? [];
        $sectionScores = [];
        $totalPoints = 0;
        $earnedPoints = 0;

        foreach ($examData['sections'] as $section) {
            $sectionPoints = 0;
            $sectionEarned = 0;

            foreach ($section['questions'] as $question) {
                $points = $question['points'];
                $totalPoints += $points;
                $sectionPoints += $points;

                $userAnswer = $answers[$question['id']] ?? null;
                if ($this->isAnswerCorrect($question, $userAnswer)) {
                    $earnedPoints += $points;
                    $sectionEarned += $points;
                }
            }

            $sectionScores[$section['name']] = [
                'earned' => $sectionEarned,
                'total' => $sectionPoints,
                'percentage' => $sectionPoints > 0 ? round(($sectionEarned / $sectionPoints) * 100, 2) : 0,
            ];
        }

        $totalScore = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0;

        return [
            'total_score' => $totalScore,
            'earned_points' => $earnedPoints,
            'total_points' => $totalPoints,
            'section_scores' => $sectionScores,
            'passed' => $totalScore >= $attempt->certification->passing_score,
        ];
    }

    private function isAnswerCorrect(array $question, $userAnswer): bool
    {
        if ($userAnswer === null) {
            return false;
        }

        switch ($question['type']) {
            case 'multiple_choice':
                return $userAnswer === $question['correct_answer'];
                
            case 'true_false':
                return $userAnswer === $question['correct_answer'];
                
            case 'code_completion':
                // Simple string comparison - in real implementation, this would be more sophisticated
                return !empty($userAnswer) && strlen($userAnswer) > 10;
                
            case 'short_answer':
                // Check for keywords presence
                $keywords = $question['keywords'] ?? [];
                $answer = strtolower($userAnswer);
                $keywordFound = false;
                
                foreach ($keywords as $keyword) {
                    if (strpos($answer, strtolower($keyword)) !== false) {
                        $keywordFound = true;
                        break;
                    }
                }
                
                return $keywordFound && strlen($userAnswer) >= 20;
                
            default:
                return false;
        }
    }

    private function generateFeedback(array $results, Certification $certification): string
    {
        $feedback = [];
        
        if ($results['passed']) {
            $feedback[] = "¡Felicitaciones! Has aprobado la certificación {$certification->name}.";
            $feedback[] = "Tu puntuación: {$results['total_score']}%";
        } else {
            $feedback[] = "No has alcanzado la puntuación mínima para aprobar ({$certification->passing_score}%).";
            $feedback[] = "Tu puntuación: {$results['total_score']}%";
            $feedback[] = "Te recomendamos repasar las áreas con menor puntuación y volver a intentarlo.";
        }

        // Section-specific feedback
        foreach ($results['section_scores'] as $sectionName => $score) {
            if ($score['percentage'] < 60) {
                $feedback[] = "Área de mejora: {$sectionName} - {$score['percentage']}%";
            } elseif ($score['percentage'] >= 90) {
                $feedback[] = "Excelente desempeño en: {$sectionName} - {$score['percentage']}%";
            }
        }

        return implode("\n", $feedback);
    }

    private function createCertificate(UserCertificationAttempt $attempt, float $score): UserCertification
    {
        $certificateNumber = $this->generateCertificateNumber();
        $verificationCode = $this->generateVerificationCode();
        
        $certification = $attempt->certification;
        $expiresAt = $certification->validity_months ? 
            now()->addMonths($certification->validity_months) : null;

        return UserCertification::create([
            'user_id' => $attempt->user_id,
            'certification_id' => $certification->id,
            'attempt_id' => $attempt->id,
            'certificate_number' => $certificateNumber,
            'verification_code' => $verificationCode,
            'score' => $score,
            'issued_at' => now(),
            'expires_at' => $expiresAt,
            'skills_validated' => $certification->skills_covered,
            'is_verified' => true,
        ]);
    }

    private function generateCertificateNumber(): string
    {
        return 'CERT-' . date('Y') . '-' . strtoupper(Str::random(8));
    }

    private function generateVerificationCode(): string
    {
        return strtoupper(Str::random(12));
    }

    public function getUserProgress(User $user, Certification $certification): array
    {
        $attempts = $certification->attempts()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $userCertification = $certification->userCertifications()
            ->where('user_id', $user->id)
            ->first();

        $bestScore = $attempts->max('score') ?? 0;
        $attemptsUsed = $attempts->count();
        $attemptsRemaining = max(0, $certification->max_attempts - $attemptsUsed);

        return [
            'attempts_used' => $attemptsUsed,
            'attempts_remaining' => $attemptsRemaining,
            'best_score' => $bestScore,
            'is_certified' => $userCertification && $userCertification->is_verified,
            'certificate' => $userCertification,
            'last_attempt' => $attempts->first(),
            'can_retake' => $attemptsRemaining > 0 && !$userCertification,
        ];
    }

    public function getAttemptResults(UserCertificationAttempt $attempt): array
    {
        return [
            'attempt' => $attempt,
            'score_breakdown' => $attempt->section_scores ?? [],
            'time_analysis' => $this->analyzeTimeSpent($attempt),
            'performance_insights' => $this->getPerformanceInsights($attempt),
            'improvement_suggestions' => $this->getImprovementSuggestions($attempt),
        ];
    }

    private function analyzeTimeSpent(UserCertificationAttempt $attempt): array
    {
        $timeSpent = $attempt->time_spent ?? [];
        
        if (empty($timeSpent)) {
            return [];
        }

        $totalTime = array_sum($timeSpent);
        $avgTimePerQuestion = count($timeSpent) > 0 ? $totalTime / count($timeSpent) : 0;
        
        return [
            'total_time_seconds' => $totalTime,
            'average_per_question' => round($avgTimePerQuestion, 2),
            'fastest_question' => min($timeSpent),
            'slowest_question' => max($timeSpent),
        ];
    }

    private function getPerformanceInsights(UserCertificationAttempt $attempt): array
    {
        $insights = [];
        
        if ($attempt->score >= 90) {
            $insights[] = 'Excelente desempeño general';
        } elseif ($attempt->score >= 70) {
            $insights[] = 'Buen desempeño con áreas de mejora';
        } else {
            $insights[] = 'Necesitas reforzar conocimientos fundamentales';
        }

        $sectionScores = $attempt->section_scores ?? [];
        foreach ($sectionScores as $section => $score) {
            if ($score['percentage'] < 50) {
                $insights[] = "Área crítica: {$section}";
            }
        }

        return $insights;
    }

    private function getImprovementSuggestions(UserCertificationAttempt $attempt): array
    {
        $suggestions = [];
        $certification = $attempt->certification;
        
        if ($attempt->score < $certification->passing_score) {
            $suggestions[] = 'Revisa el material de estudio recomendado';
            $suggestions[] = 'Practica con ejercicios adicionales';
            $suggestions[] = 'Considera tomar cursos complementarios';
        }

        $sectionScores = $attempt->section_scores ?? [];
        foreach ($sectionScores as $section => $score) {
            if ($score['percentage'] < 70) {
                $suggestions[] = "Enfócate en mejorar: {$section}";
            }
        }

        return $suggestions;
    }

    public function generateCertificatePDF(UserCertification $certificate): string
    {
        $data = [
            'certificate' => $certificate->load(['user', 'certification']),
            'issued_date' => $certificate->issued_at->format('d/m/Y'),
            'expires_date' => $certificate->expires_at?->format('d/m/Y'),
        ];

        $pdf = Pdf::loadView('certificates.template', $data)
            ->setPaper('a4', 'landscape')
            ->setOptions([
                'dpi' => 150,
                'defaultFont' => 'sans-serif',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
            ]);

        return $pdf->output();
    }
}