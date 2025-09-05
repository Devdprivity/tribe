<?php

namespace App\Services;

use App\Models\AIConversation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AIAssistantService
{
    private string $apiUrl;
    private string $apiKey;
    private array $models;

    public function __construct()
    {
        $this->apiUrl = config('services.openai.url', 'https://api.openai.com/v1');
        $this->apiKey = config('services.openai.key');
        $this->models = [
            'chat' => 'gpt-4-turbo-preview',
            'code' => 'gpt-4',
            'analysis' => 'gpt-3.5-turbo-16k',
        ];
    }

    public function processMessage(
        AIConversation $conversation, 
        string $message, 
        ?string $code = null, 
        ?string $language = null,
        ?string $filePath = null
    ): array {
        try {
            $context = $this->buildConversationContext($conversation);
            $systemPrompt = $this->getSystemPrompt($conversation->type);
            
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
                ...$context,
                [
                    'role' => 'user', 
                    'content' => $this->formatUserMessage($message, $code, $language, $filePath)
                ]
            ];

            $startTime = microtime(true);
            
            $response = $this->callOpenAI($messages, $this->models['chat']);
            
            $processingTime = (microtime(true) - $startTime) * 1000;

            $result = $this->parseAIResponse($response, $language);
            $result['processing_time'] = $processingTime;
            $result['model'] = $this->models['chat'];

            return $result;

        } catch (\Exception $e) {
            Log::error('AI Assistant processing failed', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'content' => 'Lo siento, ha ocurrido un error procesando tu mensaje. Por favor intenta de nuevo.',
                'error' => true,
            ];
        }
    }

    public function reviewCode(string $code, string $language, ?string $context = null, array $focusAreas = []): array
    {
        try {
            $prompt = $this->buildCodeReviewPrompt($code, $language, $context, $focusAreas);
            
            $messages = [
                ['role' => 'system', 'content' => $this->getCodeReviewSystemPrompt()],
                ['role' => 'user', 'content' => $prompt]
            ];

            $response = $this->callOpenAI($messages, $this->models['code']);
            
            return $this->parseCodeReviewResponse($response);

        } catch (\Exception $e) {
            Log::error('Code review failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function debugCode(
        string $code, 
        string $language, 
        ?string $errorMessage = null, 
        ?string $expectedBehavior = null,
        ?string $context = null
    ): array {
        try {
            $prompt = $this->buildDebuggingPrompt($code, $language, $errorMessage, $expectedBehavior, $context);
            
            $messages = [
                ['role' => 'system', 'content' => $this->getDebuggingSystemPrompt()],
                ['role' => 'user', 'content' => $prompt]
            ];

            $response = $this->callOpenAI($messages, $this->models['code']);
            
            return $this->parseDebuggingResponse($response);

        } catch (\Exception $e) {
            Log::error('Code debugging failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function optimizeCode(
        string $code, 
        string $language, 
        array $optimizationGoals, 
        ?string $context = null
    ): array {
        try {
            $prompt = $this->buildOptimizationPrompt($code, $language, $optimizationGoals, $context);
            
            $messages = [
                ['role' => 'system', 'content' => $this->getOptimizationSystemPrompt()],
                ['role' => 'user', 'content' => $prompt]
            ];

            $response = $this->callOpenAI($messages, $this->models['code']);
            
            return $this->parseOptimizationResponse($response);

        } catch (\Exception $e) {
            Log::error('Code optimization failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function generateCode(
        string $description, 
        string $language, 
        ?string $framework = null, 
        array $requirements = [],
        array $stylePreferences = []
    ): array {
        try {
            $prompt = $this->buildGenerationPrompt($description, $language, $framework, $requirements, $stylePreferences);
            
            $messages = [
                ['role' => 'system', 'content' => $this->getGenerationSystemPrompt()],
                ['role' => 'user', 'content' => $prompt]
            ];

            $response = $this->callOpenAI($messages, $this->models['code']);
            
            return $this->parseGenerationResponse($response);

        } catch (\Exception $e) {
            Log::error('Code generation failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function explainCode(string $code, string $language, string $complexityLevel = 'intermediate'): array
    {
        try {
            $prompt = $this->buildExplanationPrompt($code, $language, $complexityLevel);
            
            $messages = [
                ['role' => 'system', 'content' => $this->getExplanationSystemPrompt($complexityLevel)],
                ['role' => 'user', 'content' => $prompt]
            ];

            $response = $this->callOpenAI($messages, $this->models['analysis']);
            
            return $this->parseExplanationResponse($response);

        } catch (\Exception $e) {
            Log::error('Code explanation failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    private function callOpenAI(array $messages, string $model): string
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(60)->post($this->apiUrl . '/chat/completions', [
            'model' => $model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 2000,
        ]);

        if (!$response->successful()) {
            throw new \Exception('OpenAI API request failed: ' . $response->body());
        }

        $data = $response->json();
        return $data['choices'][0]['message']['content'] ?? '';
    }

    private function buildConversationContext(AIConversation $conversation): array
    {
        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->take(20) // Limit context to last 20 messages
            ->get();

        return $messages->map(function ($message) {
            $content = $message->content;
            if ($message->code) {
                $content .= "\n\n```" . ($message->language ?? '') . "\n" . $message->code . "\n```";
            }
            
            return [
                'role' => $message->role,
                'content' => $content,
            ];
        })->toArray();
    }

    private function formatUserMessage(string $message, ?string $code, ?string $language, ?string $filePath): string
    {
        $formatted = $message;
        
        if ($filePath) {
            $formatted = "Archivo: `{$filePath}`\n\n" . $formatted;
        }
        
        if ($code) {
            $formatted .= "\n\n```" . ($language ?? '') . "\n{$code}\n```";
        }
        
        return $formatted;
    }

    private function getSystemPrompt(string $conversationType): string
    {
        return match($conversationType) {
            'code_review' => $this->getCodeReviewSystemPrompt(),
            'debugging' => $this->getDebuggingSystemPrompt(),
            'learning' => $this->getLearningSystemPrompt(),
            'optimization' => $this->getOptimizationSystemPrompt(),
            default => $this->getGeneralSystemPrompt(),
        };
    }

    private function getGeneralSystemPrompt(): string
    {
        return "Eres un asistente de IA especializado en programación y desarrollo de software. Tu objetivo es ayudar a los desarrolladores con sus preguntas, problemas de código, y aprendizaje.

Características:
- Proporciona respuestas claras y concisas
- Incluye ejemplos de código cuando sea relevante
- Explica conceptos complejos de manera simple
- Sugiere mejores prácticas
- Mantén un tono profesional pero amigable
- Responde en español

Cuando muestres código:
- Usa el formato de código apropiado
- Incluye comentarios explicativos
- Proporciona contexto sobre por qué funciona la solución";
    }

    private function getCodeReviewSystemPrompt(): string
    {
        return "Eres un experto revisor de código senior. Tu trabajo es analizar código y proporcionar feedback constructivo.

Enfócate en:
- Calidad del código y legibilidad
- Rendimiento y optimización
- Seguridad y vulnerabilidades
- Mejores prácticas del lenguaje
- Mantenibilidad y escalabilidad
- Patrones de diseño
- Testing y documentación

Formato de respuesta:
1. **Resumen general**
2. **Aspectos positivos**
3. **Áreas de mejora**
4. **Sugerencias específicas** (con código si es necesario)
5. **Prioridad** (Alta/Media/Baja para cada sugerencia)";
    }

    private function getDebuggingSystemPrompt(): string
    {
        return "Eres un experto en debugging y resolución de problemas de código.

Tu proceso:
1. Analiza el código cuidadosamente
2. Identifica posibles causas del error
3. Proporciona soluciones paso a paso
4. Explica por qué ocurre el problema
5. Sugiere formas de prevenir errores similares

Incluye:
- Explicación clara del problema
- Código corregido
- Explicación de los cambios
- Tips de prevención
- Herramientas de debugging recomendadas";
    }

    private function getOptimizationSystemPrompt(): string
    {
        return "Eres un especialista en optimización de código y rendimiento.

Analiza y optimiza considerando:
- Complejidad temporal y espacial
- Uso eficiente de memoria
- Algoritmos más eficientes
- Estructuras de datos apropiadas
- Optimizaciones específicas del lenguaje
- Patrones de rendimiento

Proporciona:
- Código optimizado
- Análisis de complejidad (antes/después)
- Explicación de las mejoras
- Métricas de rendimiento esperadas
- Trade-offs considerados";
    }

    private function getLearningSystemPrompt(): string
    {
        return "Eres un mentor de programación que ayuda a los desarrolladores a aprender.

Tu enfoque:
- Explica conceptos desde lo básico
- Usa analogías cuando sea útil
- Proporciona ejemplos progresivos
- Relaciona conceptos con casos de uso reales
- Sugiere recursos adicionales para aprender
- Fomenta las mejores prácticas desde el inicio

Adapta tu explicación al nivel del desarrollador y proporciona ejercicios prácticos cuando sea apropiado.";
    }

    private function getGenerationSystemPrompt(): string
    {
        return "Eres un generador de código experto que crea soluciones de alta calidad.

Princpios:
- Código limpio y bien estructurado
- Seguir convenciones del lenguaje
- Incluir manejo de errores apropiado
- Agregar comentarios explicativos
- Considerar escalabilidad y mantenimiento
- Incluir ejemplos de uso

Proporciona:
- Código completo y funcional
- Explicación de la arquitectura
- Instrucciones de uso
- Dependencias necesarias
- Consideraciones importantes";
    }

    private function getExplanationSystemPrompt(string $complexityLevel): string
    {
        $levelInstructions = match($complexityLevel) {
            'beginner' => 'Explica como si fuera para alguien nuevo en programación. Usa analogías simples y evita jerga técnica compleja.',
            'advanced' => 'Proporciona explicaciones técnicas profundas, incluyendo detalles de implementación y consideraciones avanzadas.',
            default => 'Explica a nivel intermedio, asumiendo conocimiento básico de programación pero explicando conceptos más avanzados.',
        };

        return "Eres un experto explicando código y conceptos de programación.

Nivel de explicación: {$complexityLevel}
{$levelInstructions}

Tu explicación debe incluir:
- Propósito general del código
- Análisis línea por línea o bloque por bloque
- Conceptos clave utilizados
- Patrones de diseño empleados
- Posibles mejoras o alternativas
- Casos de uso típicos";
    }

    private function buildCodeReviewPrompt(string $code, string $language, ?string $context, array $focusAreas): string
    {
        $prompt = "Por favor revisa este código en {$language}:\n\n```{$language}\n{$code}\n```";
        
        if ($context) {
            $prompt .= "\n\nContexto: {$context}";
        }
        
        if (!empty($focusAreas)) {
            $prompt .= "\n\nEnfócate especialmente en: " . implode(', ', $focusAreas);
        }
        
        return $prompt;
    }

    private function buildDebuggingPrompt(
        string $code, 
        string $language, 
        ?string $errorMessage, 
        ?string $expectedBehavior,
        ?string $context
    ): string {
        $prompt = "Ayúdame a debuggear este código en {$language}:\n\n```{$language}\n{$code}\n```";
        
        if ($errorMessage) {
            $prompt .= "\n\nError: {$errorMessage}";
        }
        
        if ($expectedBehavior) {
            $prompt .= "\n\nComportamiento esperado: {$expectedBehavior}";
        }
        
        if ($context) {
            $prompt .= "\n\nContexto adicional: {$context}";
        }
        
        return $prompt;
    }

    private function buildOptimizationPrompt(string $code, string $language, array $goals, ?string $context): string
    {
        $prompt = "Optimiza este código en {$language}:\n\n```{$language}\n{$code}\n```";
        $prompt .= "\n\nObjetivos de optimización: " . implode(', ', $goals);
        
        if ($context) {
            $prompt .= "\n\nContexto: {$context}";
        }
        
        return $prompt;
    }

    private function buildGenerationPrompt(
        string $description, 
        string $language, 
        ?string $framework, 
        array $requirements,
        array $stylePreferences
    ): string {
        $prompt = "Genera código en {$language} para: {$description}";
        
        if ($framework) {
            $prompt .= "\n\nFramework: {$framework}";
        }
        
        if (!empty($requirements)) {
            $prompt .= "\n\nRequisitos:\n" . implode("\n", array_map(fn($r) => "- {$r}", $requirements));
        }
        
        if (!empty($stylePreferences)) {
            $prompt .= "\n\nPreferencias de estilo:\n" . implode("\n", array_map(fn($p) => "- {$p}", $stylePreferences));
        }
        
        return $prompt;
    }

    private function buildExplanationPrompt(string $code, string $language, string $complexityLevel): string
    {
        return "Explica este código en {$language} (nivel {$complexityLevel}):\n\n```{$language}\n{$code}\n```";
    }

    private function parseAIResponse(string $response, ?string $language): array
    {
        // Extract code blocks if present
        $codeBlocks = [];
        $pattern = '/```(\w+)?\n(.*?)\n```/s';
        
        if (preg_match_all($pattern, $response, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $codeBlocks[] = [
                    'language' => $match[1] ?? $language ?? 'text',
                    'code' => $match[2],
                ];
            }
        }

        // Extract suggestions (lines starting with "Sugerencia:" or similar)
        $suggestions = [];
        $lines = explode("\n", $response);
        
        foreach ($lines as $line) {
            if (preg_match('/^(\*\*)?Sugerencia(\*\*)?:?\s*(.+)/', $line, $match)) {
                $suggestions[] = trim($match[3]);
            }
        }

        return [
            'content' => $response,
            'code_blocks' => $codeBlocks,
            'suggestions' => $suggestions,
            'confidence' => $this->estimateConfidence($response),
        ];
    }

    private function parseCodeReviewResponse(string $response): array
    {
        return [
            'review' => $response,
            'score' => $this->extractScore($response),
            'issues' => $this->extractIssues($response),
            'suggestions' => $this->extractSuggestions($response),
        ];
    }

    private function parseDebuggingResponse(string $response): array
    {
        return [
            'analysis' => $response,
            'fixes' => $this->extractFixes($response),
            'explanation' => $this->extractExplanation($response),
        ];
    }

    private function parseOptimizationResponse(string $response): array
    {
        $codePattern = '/```\w*\n(.*?)\n```/s';
        $optimizedCode = null;
        
        if (preg_match($codePattern, $response, $match)) {
            $optimizedCode = $match[1];
        }

        return [
            'analysis' => $response,
            'optimized_code' => $optimizedCode,
            'improvements' => $this->extractImprovements($response),
        ];
    }

    private function parseGenerationResponse(string $response): array
    {
        $codePattern = '/```\w*\n(.*?)\n```/s';
        $generatedCode = null;
        
        if (preg_match($codePattern, $response, $match)) {
            $generatedCode = $match[1];
        }

        return [
            'explanation' => $response,
            'code' => $generatedCode,
            'usage_examples' => $this->extractUsageExamples($response),
        ];
    }

    private function parseExplanationResponse(string $response): array
    {
        return [
            'explanation' => $response,
            'key_concepts' => $this->extractKeyConcepts($response),
            'complexity_analysis' => $this->extractComplexityAnalysis($response),
        ];
    }

    private function estimateConfidence(string $response): float
    {
        // Simple confidence estimation based on response characteristics
        $indicators = [
            'no estoy seguro' => -0.3,
            'podría ser' => -0.2,
            'probablemente' => -0.1,
            'definitivamente' => 0.2,
            'claramente' => 0.2,
            'exactamente' => 0.3,
        ];

        $confidence = 0.7; // Base confidence
        $lowerResponse = strtolower($response);

        foreach ($indicators as $phrase => $impact) {
            if (strpos($lowerResponse, $phrase) !== false) {
                $confidence += $impact;
            }
        }

        return max(0.1, min(1.0, $confidence));
    }

    private function extractScore(string $response): ?int
    {
        if (preg_match('/puntuación.*?(\d+)/i', $response, $match)) {
            return (int)$match[1];
        }
        return null;
    }

    private function extractIssues(string $response): array
    {
        $issues = [];
        $lines = explode("\n", $response);
        
        foreach ($lines as $line) {
            if (preg_match('/^\s*[-*]\s*(.+problema.+|.+error.+|.+issue.+)/i', $line, $match)) {
                $issues[] = trim($match[1]);
            }
        }
        
        return $issues;
    }

    private function extractSuggestions(string $response): array
    {
        $suggestions = [];
        $lines = explode("\n", $response);
        
        foreach ($lines as $line) {
            if (preg_match('/^\s*[-*]\s*(.+suger.+|.+recomiend.+|.+mejor.+)/i', $line, $match)) {
                $suggestions[] = trim($match[1]);
            }
        }
        
        return $suggestions;
    }

    private function extractFixes(string $response): array
    {
        // Extract code fixes from the response
        $fixes = [];
        if (preg_match_all('/```\w*\n(.*?)\n```/s', $response, $matches)) {
            $fixes = $matches[1];
        }
        return $fixes;
    }

    private function extractExplanation(string $response): string
    {
        // Remove code blocks to get just the explanation
        return preg_replace('/```.*?```/s', '', $response);
    }

    private function extractImprovements(string $response): array
    {
        $improvements = [];
        $lines = explode("\n", $response);
        
        foreach ($lines as $line) {
            if (preg_match('/^\s*[-*]\s*(.+mejor.+|.+optimiz.+|.+eficien.+)/i', $line, $match)) {
                $improvements[] = trim($match[1]);
            }
        }
        
        return $improvements;
    }

    private function extractUsageExamples(string $response): array
    {
        $examples = [];
        if (preg_match_all('/ejemplo.*?```\w*\n(.*?)\n```/si', $response, $matches)) {
            $examples = $matches[1];
        }
        return $examples;
    }

    private function extractKeyConcepts(string $response): array
    {
        $concepts = [];
        $lines = explode("\n", $response);
        
        foreach ($lines as $line) {
            if (preg_match('/^\s*[-*]\s*(.+concepto.+|.+patrón.+|.+algoritmo.+)/i', $line, $match)) {
                $concepts[] = trim($match[1]);
            }
        }
        
        return $concepts;
    }

    private function extractComplexityAnalysis(string $response): ?string
    {
        if (preg_match('/complejidad.*?O\([^)]+\)/i', $response, $match)) {
            return $match[0];
        }
        return null;
    }

    public function getCapabilities(): array
    {
        return [
            'code_review' => 'Revisión de código con feedback detallado',
            'debugging' => 'Identificación y solución de bugs',
            'optimization' => 'Optimización de rendimiento y memoria',
            'generation' => 'Generación de código desde descripciones',
            'explanation' => 'Explicación de código complejo',
            'learning' => 'Tutoría y enseñanza de conceptos',
            'refactoring' => 'Refactorización y mejora de estructura',
            'testing' => 'Sugerencias de estrategias de testing',
        ];
    }

    public function getCodeTemplates(): array
    {
        return [
            'function' => 'Función básica',
            'class' => 'Clase con métodos',
            'api_endpoint' => 'Endpoint de API REST',
            'database_model' => 'Modelo de base de datos',
            'test_case' => 'Caso de prueba',
            'algorithm' => 'Algoritmo específico',
            'ui_component' => 'Componente de interfaz',
            'data_structure' => 'Estructura de datos personalizada',
        ];
    }

    public function getSupportedLanguages(): array
    {
        return [
            'javascript', 'python', 'java', 'php', 'typescript', 'c++', 'c#',
            'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css', 'sql',
            'bash', 'powershell', 'dart', 'scala', 'r', 'matlab'
        ];
    }
}