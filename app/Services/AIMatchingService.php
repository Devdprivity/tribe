<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobOpportunity;
use App\Models\UserSkill;
use Illuminate\Support\Collection;

class AIMatchingService
{
    public function calculateJobMatchScore(User $user, JobOpportunity $job): float
    {
        $scores = [
            'skills' => $this->calculateSkillsMatch($user, $job),
            'experience' => $this->calculateExperienceMatch($user, $job),
            'location' => $this->calculateLocationMatch($user, $job),
            'salary' => $this->calculateSalaryMatch($user, $job),
            'tech_stack' => $this->calculateTechStackMatch($user, $job),
        ];

        // Weighted average
        $weights = [
            'skills' => 0.4,
            'experience' => 0.25,
            'location' => 0.15,
            'salary' => 0.1,
            'tech_stack' => 0.1,
        ];

        $totalScore = 0;
        foreach ($scores as $category => $score) {
            $totalScore += $score * $weights[$category];
        }

        return round($totalScore, 2);
    }

    public function getJobRecommendations(User $user, int $limit = 10): Collection
    {
        $jobs = JobOpportunity::where('status', 'published')
            ->with('company')
            ->get();

        $scoredJobs = $jobs->map(function ($job) use ($user) {
            $job->match_score = $this->calculateJobMatchScore($user, $job);
            return $job;
        })->sortByDesc('match_score');

        return $scoredJobs->take($limit)->values();
    }

    public function analyzeSkillsMatch(User $user, JobOpportunity $job): array
    {
        $userSkills = $user->skills()->pluck('skill_name')->toArray();
        $requiredSkills = $job->required_skills ?? [];
        $preferredSkills = $job->preferred_skills ?? [];

        $matchedRequired = array_intersect($userSkills, $requiredSkills);
        $matchedPreferred = array_intersect($userSkills, $preferredSkills);
        $missingRequired = array_diff($requiredSkills, $userSkills);
        $missingPreferred = array_diff($preferredSkills, $userSkills);

        return [
            'matched_required' => $matchedRequired,
            'matched_preferred' => $matchedPreferred,
            'missing_required' => $missingRequired,
            'missing_preferred' => $missingPreferred,
            'required_match_percentage' => empty($requiredSkills) ? 100 : 
                round((count($matchedRequired) / count($requiredSkills)) * 100, 2),
            'preferred_match_percentage' => empty($preferredSkills) ? 100 :
                round((count($matchedPreferred) / count($preferredSkills)) * 100, 2),
        ];
    }

    private function calculateSkillsMatch(User $user, JobOpportunity $job): float
    {
        $userSkills = $user->skills()->pluck('skill_name')->toArray();
        $requiredSkills = $job->required_skills ?? [];
        $preferredSkills = $job->preferred_skills ?? [];

        if (empty($requiredSkills) && empty($preferredSkills)) {
            return 100;
        }

        $requiredMatch = 0;
        if (!empty($requiredSkills)) {
            $matched = array_intersect($userSkills, $requiredSkills);
            $requiredMatch = (count($matched) / count($requiredSkills)) * 100;
        }

        $preferredMatch = 0;
        if (!empty($preferredSkills)) {
            $matched = array_intersect($userSkills, $preferredSkills);
            $preferredMatch = (count($matched) / count($preferredSkills)) * 100;
        }

        // Required skills are weighted more heavily
        $totalSkills = count($requiredSkills) + count($preferredSkills);
        if ($totalSkills === 0) return 100;

        $requiredWeight = count($requiredSkills) / $totalSkills * 0.8;
        $preferredWeight = count($preferredSkills) / $totalSkills * 0.2;

        return ($requiredMatch * $requiredWeight) + ($preferredMatch * $preferredWeight);
    }

    private function calculateExperienceMatch(User $user, JobOpportunity $job): float
    {
        $userExperience = $user->years_experience ?? 0;
        $jobLevel = $job->experience_level;

        $levelMap = [
            'entry' => [0, 1],
            'junior' => [1, 3],
            'mid' => [3, 6],
            'senior' => [6, 10],
            'lead' => [8, 15],
            'principal' => [10, 20],
        ];

        if (!isset($levelMap[$jobLevel])) {
            return 75; // Default score for unknown levels
        }

        [$minExp, $maxExp] = $levelMap[$jobLevel];

        if ($userExperience >= $minExp && $userExperience <= $maxExp) {
            return 100;
        } elseif ($userExperience < $minExp) {
            $diff = $minExp - $userExperience;
            return max(0, 100 - ($diff * 20)); // Penalize heavily for under-qualification
        } else {
            $diff = $userExperience - $maxExp;
            return max(50, 100 - ($diff * 10)); // Light penalty for over-qualification
        }
    }

    private function calculateLocationMatch(User $user, JobOpportunity $job): float
    {
        if ($job->work_mode === 'remote') {
            return 100;
        }

        $userLocation = $user->location ?? '';
        $jobLocation = $job->location ?? '';

        if (empty($userLocation) || empty($jobLocation)) {
            return 75; // Neutral score if location data is missing
        }

        // Simple string matching - in a real app, you'd use geolocation services
        similar_text(strtolower($userLocation), strtolower($jobLocation), $percent);

        return $percent;
    }

    private function calculateSalaryMatch(User $user, JobOpportunity $job): float
    {
        $userExpectedSalary = $user->expected_salary ?? null;
        $jobSalaryMin = $job->salary_min ?? null;
        $jobSalaryMax = $job->salary_max ?? null;

        // If no salary expectations or job doesn't specify, neutral score
        if (!$userExpectedSalary || (!$jobSalaryMin && !$jobSalaryMax)) {
            return 75;
        }

        // If job offers within or above user expectations
        if ($jobSalaryMin && $jobSalaryMin >= $userExpectedSalary) {
            return 100;
        }

        if ($jobSalaryMax && $jobSalaryMax >= $userExpectedSalary) {
            return 90;
        }

        // Calculate how far below expectations the job salary is
        $jobSalaryAvg = ($jobSalaryMin + $jobSalaryMax) / 2;
        $diff = ($userExpectedSalary - $jobSalaryAvg) / $userExpectedSalary;

        return max(0, 100 - ($diff * 100));
    }

    private function calculateTechStackMatch(User $user, JobOpportunity $job): float
    {
        $userTechs = $user->skills()
            ->where('category', 'programming_language')
            ->orWhere('category', 'framework')
            ->orWhere('category', 'tool')
            ->pluck('skill_name')
            ->toArray();

        $jobTechStack = $job->tech_stack ?? [];

        if (empty($jobTechStack)) {
            return 100;
        }

        if (empty($userTechs)) {
            return 0;
        }

        $matched = array_intersect($userTechs, $jobTechStack);
        return (count($matched) / count($jobTechStack)) * 100;
    }

    public function getCandidateRecommendations(JobOpportunity $job, int $limit = 20): Collection
    {
        $users = User::whereHas('skills')->with('skills')->get();

        $scoredUsers = $users->map(function ($user) use ($job) {
            $user->match_score = $this->calculateJobMatchScore($user, $job);
            return $user;
        })->sortByDesc('match_score');

        return $scoredUsers->take($limit)->values();
    }

    public function getSkillGapAnalysis(User $user, JobOpportunity $job): array
    {
        $userSkills = $user->skills()->pluck('skill_name')->toArray();
        $requiredSkills = $job->required_skills ?? [];
        $preferredSkills = $job->preferred_skills ?? [];
        $techStack = $job->tech_stack ?? [];

        $allJobSkills = array_unique(array_merge($requiredSkills, $preferredSkills, $techStack));
        $missingSkills = array_diff($allJobSkills, $userSkills);

        // Categorize missing skills by priority
        $criticalGaps = array_intersect($missingSkills, $requiredSkills);
        $importantGaps = array_intersect($missingSkills, $techStack);
        $niceToHaveGaps = array_intersect($missingSkills, $preferredSkills);

        return [
            'critical_gaps' => array_values($criticalGaps),
            'important_gaps' => array_values($importantGaps),
            'nice_to_have_gaps' => array_values($niceToHaveGaps),
            'total_gaps' => count($missingSkills),
            'readiness_score' => $this->calculateJobMatchScore($user, $job),
        ];
    }
}