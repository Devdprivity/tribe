<?php

namespace App\Services;

use App\Models\ChallengeSubmission;
use App\Models\CodingChallenge;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CodeExecutionService
{
    private string $executionApiUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->executionApiUrl = config('services.code_execution.url', 'http://localhost:3000');
        $this->apiKey = config('services.code_execution.api_key', '');
    }

    public function executeSubmission(ChallengeSubmission $submission, CodingChallenge $challenge): array
    {
        try {
            // Prepare execution request
            $payload = [
                'language' => $submission->programming_language,
                'code' => $submission->code,
                'test_cases' => $challenge->test_cases,
                'time_limit' => $challenge->time_limit_seconds,
                'memory_limit' => $challenge->memory_limit_mb,
            ];

            // Make API request to code execution service
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->executionApiUrl . '/execute', $payload);

            if (!$response->successful()) {
                return $this->handleExecutionError('API request failed', $response->body());
            }

            $result = $response->json();
            
            return $this->processExecutionResult($result, $challenge);

        } catch (\Exception $e) {
            Log::error('Code execution failed', [
                'submission_id' => $submission->id,
                'error' => $e->getMessage(),
            ]);

            return $this->handleExecutionError('Execution service unavailable', $e->getMessage());
        }
    }

    private function processExecutionResult(array $result, CodingChallenge $challenge): array
    {
        $testResults = $result['test_results'] ?? [];
        $totalTests = count($challenge->test_cases);
        $passedTests = 0;

        foreach ($testResults as $testResult) {
            if ($testResult['passed'] ?? false) {
                $passedTests++;
            }
        }

        // Determine overall status
        $status = 'wrong_answer';
        if ($result['compilation_error'] ?? false) {
            $status = 'compilation_error';
        } elseif ($result['runtime_error'] ?? false) {
            $status = 'runtime_error';
        } elseif ($result['time_limit_exceeded'] ?? false) {
            $status = 'time_limit';
        } elseif ($result['memory_limit_exceeded'] ?? false) {
            $status = 'memory_limit';
        } elseif ($passedTests === $totalTests) {
            $status = 'accepted';
        }

        // Calculate score
        $score = 0;
        if ($status === 'accepted') {
            $score = $challenge->points_reward;
            
            // Bonus for faster execution
            $executionTime = $result['execution_time_ms'] ?? 0;
            $timeLimit = $challenge->time_limit_seconds * 1000;
            
            if ($executionTime < $timeLimit * 0.5) {
                $score = intval($score * 1.2); // 20% bonus for fast execution
            }
        } else {
            // Partial credit for passed tests
            $score = intval(($passedTests / $totalTests) * $challenge->points_reward * 0.3);
        }

        return [
            'status' => $status,
            'test_results' => $testResults,
            'execution_time_ms' => $result['execution_time_ms'] ?? null,
            'memory_used_mb' => $result['memory_used_mb'] ?? null,
            'error_message' => $result['error_message'] ?? null,
            'score' => $score,
            'passed_tests' => $passedTests,
            'total_tests' => $totalTests,
        ];
    }

    private function handleExecutionError(string $message, string $details = ''): array
    {
        return [
            'status' => 'runtime_error',
            'test_results' => [],
            'execution_time_ms' => null,
            'memory_used_mb' => null,
            'error_message' => $message . ($details ? ': ' . $details : ''),
            'score' => 0,
            'passed_tests' => 0,
            'total_tests' => 0,
        ];
    }

    public function validateCode(string $language, string $code): array
    {
        try {
            $payload = [
                'language' => $language,
                'code' => $code,
                'validate_only' => true,
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($this->executionApiUrl . '/validate', $payload);

            if (!$response->successful()) {
                return ['valid' => false, 'error' => 'Validation service unavailable'];
            }

            return $response->json();

        } catch (\Exception $e) {
            return ['valid' => false, 'error' => $e->getMessage()];
        }
    }

    public function getLanguageTemplate(string $language): string
    {
        return match($language) {
            'python' => $this->getPythonTemplate(),
            'javascript' => $this->getJavaScriptTemplate(),
            'java' => $this->getJavaTemplate(),
            'cpp' => $this->getCppTemplate(),
            'c' => $this->getCTemplate(),
            'csharp' => $this->getCSharpTemplate(),
            'php' => $this->getPhpTemplate(),
            'ruby' => $this->getRubyTemplate(),
            'go' => $this->getGoTemplate(),
            'rust' => $this->getRustTemplate(),
            default => '',
        };
    }

    private function getPythonTemplate(): string
    {
        return <<<PYTHON
def solution():
    # Tu código aquí
    pass

# Ejemplo de uso:
# result = solution()
# print(result)
PYTHON;
    }

    private function getJavaScriptTemplate(): string
    {
        return <<<JS
function solution() {
    // Tu código aquí
}

// Ejemplo de uso:
// const result = solution();
// console.log(result);
JS;
    }

    private function getJavaTemplate(): string
    {
        return <<<JAVA
public class Solution {
    public static void main(String[] args) {
        // Tu código aquí
    }
    
    // Métodos auxiliares aquí
}
JAVA;
    }

    private function getCppTemplate(): string
    {
        return <<<CPP
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    // Tu código aquí
    return 0;
}
CPP;
    }

    private function getCTemplate(): string
    {
        return <<<C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Tu código aquí
    return 0;
}
C;
    }

    private function getCSharpTemplate(): string
    {
        return <<<CSHARP
using System;
using System.Collections.Generic;
using System.Linq;

public class Solution 
{
    public static void Main() 
    {
        // Tu código aquí
    }
}
CSHARP;
    }

    private function getPhpTemplate(): string
    {
        return <<<PHP
<?php

function solution() {
    // Tu código aquí
}

// Ejemplo de uso:
// $result = solution();
// echo $result;

?>
PHP;
    }

    private function getRubyTemplate(): string
    {
        return <<<RUBY
def solution
    # Tu código aquí
end

# Ejemplo de uso:
# result = solution()
# puts result
RUBY;
    }

    private function getGoTemplate(): string
    {
        return <<<GO
package main

import "fmt"

func main() {
    // Tu código aquí
}
GO;
    }

    private function getRustTemplate(): string
    {
        return <<<RUST
fn main() {
    // Tu código aquí
}
RUST;
    }

    public function getSupportedLanguages(): array
    {
        return [
            'python',
            'javascript',
            'java',
            'cpp',
            'c',
            'csharp',
            'php',
            'ruby',
            'go',
            'rust',
        ];
    }
}