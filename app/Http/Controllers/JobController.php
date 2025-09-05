<?php

namespace App\Http\Controllers;

use App\Models\JobOpportunity;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\AIMatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only([
            'search', 'employment_type', 'work_mode', 'experience_level',
            'salary_min', 'salary_max', 'tech_stack', 'location'
        ]);

        $jobs = JobOpportunity::query()
            ->with(['company'])
            ->where('status', 'published')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereJsonContains('tech_stack', $search);
                });
            })
            ->when($filters['employment_type'] ?? null, function ($query, $type) {
                $query->where('employment_type', $type);
            })
            ->when($filters['work_mode'] ?? null, function ($query, $mode) {
                $query->where('work_mode', $mode);
            })
            ->when($filters['experience_level'] ?? null, function ($query, $level) {
                $query->where('experience_level', $level);
            })
            ->when($filters['salary_min'] ?? null, function ($query, $min) {
                $query->where('salary_max', '>=', $min);
            })
            ->when($filters['salary_max'] ?? null, function ($query, $max) {
                $query->where('salary_min', '<=', $max);
            })
            ->when($filters['tech_stack'] ?? null, function ($query, $tech) {
                $query->whereJsonContains('tech_stack', $tech);
            })
            ->when($filters['location'] ?? null, function ($query, $location) {
                $query->where('location', 'like', "%{$location}%");
            })
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->paginate(20);

        // AI-powered job recommendations for authenticated users
        $recommendations = [];
        if (Auth::check()) {
            $aiService = new AIMatchingService();
            $recommendations = $aiService->getJobRecommendations(Auth::user(), 5);
        }

        return Inertia::render('Jobs/Index', [
            'jobs' => $jobs,
            'recommendations' => $recommendations,
            'filters' => $filters,
            'employmentTypes' => $this->getEmploymentTypes(),
            'workModes' => $this->getWorkModes(),
            'experienceLevels' => $this->getExperienceLevels(),
            'popularTechStack' => $this->getPopularTechStack(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Jobs/Create', [
            'employmentTypes' => $this->getEmploymentTypes(),
            'workModes' => $this->getWorkModes(),
            'experienceLevels' => $this->getExperienceLevels(),
            'popularTechStack' => $this->getPopularTechStack(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'required|string',
            'responsibilities' => 'required|string',
            'required_skills' => 'required|array|min:1',
            'preferred_skills' => 'nullable|array',
            'tech_stack' => 'required|array|min:1',
            'employment_type' => 'required|in:full_time,part_time,contract,freelance,internship',
            'experience_level' => 'required|in:entry,junior,mid,senior,lead,principal',
            'work_mode' => 'required|in:remote,hybrid,on_site',
            'location' => 'nullable|string|max:255',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'benefits' => 'nullable|array',
            'visa_sponsorship' => 'boolean',
            'application_deadline' => 'nullable|date|after:today',
            'positions_available' => 'integer|min:1',
        ]);

        $job = JobOpportunity::create([
            'company_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'requirements' => $request->requirements,
            'responsibilities' => $request->responsibilities,
            'required_skills' => $request->required_skills,
            'preferred_skills' => $request->preferred_skills,
            'tech_stack' => $request->tech_stack,
            'employment_type' => $request->employment_type,
            'experience_level' => $request->experience_level,
            'work_mode' => $request->work_mode,
            'location' => $request->location,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'benefits' => $request->benefits,
            'visa_sponsorship' => $request->visa_sponsorship ?? false,
            'application_deadline' => $request->application_deadline,
            'positions_available' => $request->positions_available ?? 1,
            'status' => 'published',
        ]);

        return redirect()->route('jobs.show', $job)
            ->with('success', 'Trabajo publicado exitosamente.');
    }

    public function show(JobOpportunity $job)
    {
        $job->load(['company', 'applications' => function ($query) {
            $query->where('applicant_id', Auth::id());
        }]);

        $job->increment('views_count');

        // AI matching score for current user
        $matchScore = null;
        if (Auth::check()) {
            $aiService = new AIMatchingService();
            $matchScore = $aiService->calculateJobMatchScore(Auth::user(), $job);
        }

        // Similar jobs
        $similarJobs = JobOpportunity::where('id', '!=', $job->id)
            ->where('status', 'published')
            ->where(function ($query) use ($job) {
                $query->where('employment_type', $job->employment_type)
                      ->orWhere('experience_level', $job->experience_level)
                      ->orWhere(function ($q) use ($job) {
                          foreach ($job->tech_stack as $tech) {
                              $q->orWhereJsonContains('tech_stack', $tech);
                          }
                      });
            })
            ->with('company')
            ->take(6)
            ->get();

        return Inertia::render('Jobs/Show', [
            'job' => $job,
            'matchScore' => $matchScore,
            'similarJobs' => $similarJobs,
            'userApplication' => $job->applications->first(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Job $job)
    {
        Gate::authorize('update', $job);

        return Inertia::render('jobs/edit', [
            'job' => $job,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Job $job)
    {
        Gate::authorize('update', $job);

        $request->validate([
            'company_name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|array',
            'salary_range' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'remote_friendly' => 'boolean',
        ]);

        $job->update([
            'company_name' => $request->company_name,
            'title' => $request->title,
            'description' => $request->description,
            'requirements' => $request->requirements,
            'salary_range' => $request->salary_range,
            'location' => $request->location,
            'remote_friendly' => $request->remote_friendly ?? false,
        ]);

        return redirect()->route('jobs.show', $job)
            ->with('success', '¡Trabajo actualizado exitosamente!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Job $job)
    {
        Gate::authorize('delete', $job);

        $job->delete();

        return redirect()->route('jobs.index')
            ->with('success', '¡Trabajo eliminado exitosamente!');
    }

    public function apply(Request $request, JobOpportunity $job)
    {
        $request->validate([
            'cover_letter' => 'required|string|max:2000',
            'resume_url' => 'nullable|url',
            'portfolio_url' => 'nullable|url',
            'answers' => 'nullable|array',
        ]);

        // Check if user already applied
        $existingApplication = $job->applications()
            ->where('applicant_id', Auth::id())
            ->exists();

        if ($existingApplication) {
            return back()->withErrors(['error' => 'Ya has aplicado a esta posición.']);
        }

        // Calculate AI match score
        $aiService = new AIMatchingService();
        $matchScore = $aiService->calculateJobMatchScore(Auth::user(), $job);
        $skillsMatch = $aiService->analyzeSkillsMatch(Auth::user(), $job);

        $application = $job->applications()->create([
            'applicant_id' => Auth::id(),
            'cover_letter' => $request->cover_letter,
            'resume_url' => $request->resume_url,
            'portfolio_url' => $request->portfolio_url,
            'answers' => $request->answers,
            'status' => 'applied',
            'ai_match_score' => $matchScore,
            'skills_match' => $skillsMatch,
        ]);

        $job->increment('applications_count');

        return redirect()->route('jobs.show', $job)
            ->with('success', 'Aplicación enviada exitosamente.');
    }

    /**
     * View job applications
     */
    public function applications(Job $job)
    {
        Gate::authorize('viewApplications', $job);

        $applications = $job->applications()
            ->with(['user'])
            ->latest()
            ->paginate(10);

        return Inertia::render('jobs/applications', [
            'job' => $job,
            'applications' => $applications,
        ]);
    }

    /**
     * Update application status
     */
    public function updateApplicationStatus(Request $request, Job $job, JobApplication $application)
    {
        Gate::authorize('updateApplication', $job);

        $request->validate([
            'status' => 'required|in:pending,reviewed,interview,accepted,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);

        $application->update([
            'status' => $request->status,
            'notes' => $request->notes,
        ]);

        return back()->with('success', '¡Estado de aplicación actualizado exitosamente!');
    }

    /**
     * Toggle job active status
     */
    public function toggleActive(Job $job)
    {
        Gate::authorize('update', $job);

        $job->update(['is_active' => !$job->is_active]);

        $message = $job->is_active ? 'Trabajo activado' : 'Trabajo desactivado';

        return back()->with('success', "¡{$message} exitosamente!");
    }

    public function myApplications()
    {
        $applications = JobApplication::where('applicant_id', Auth::id())
            ->with(['job.company'])
            ->orderByDesc('created_at')
            ->paginate(20);

        $stats = [
            'total' => $applications->total(),
            'pending' => JobApplication::where('applicant_id', Auth::id())
                ->whereIn('status', ['applied', 'reviewing'])
                ->count(),
            'interviews' => JobApplication::where('applicant_id', Auth::id())
                ->where('status', 'interview')
                ->count(),
            'offers' => JobApplication::where('applicant_id', Auth::id())
                ->where('status', 'offer')
                ->count(),
        ];

        return Inertia::render('Jobs/MyApplications', [
            'applications' => $applications,
            'stats' => $stats,
        ]);
    }

    public function companyDashboard()
    {
        $user = Auth::user();
        
        $jobs = JobOpportunity::where('company_id', $user->id)
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->paginate(20);

        $stats = [
            'total_jobs' => $jobs->total(),
            'active_jobs' => JobOpportunity::where('company_id', $user->id)
                ->where('status', 'published')
                ->count(),
            'total_applications' => JobApplication::whereHas('job', function ($query) use ($user) {
                $query->where('company_id', $user->id);
            })->count(),
            'pending_reviews' => JobApplication::whereHas('job', function ($query) use ($user) {
                $query->where('company_id', $user->id);
            })->where('status', 'applied')->count(),
        ];

        return Inertia::render('Jobs/CompanyDashboard', [
            'jobs' => $jobs,
            'stats' => $stats,
        ]);
    }

    private function getEmploymentTypes(): array
    {
        return [
            'full_time' => 'Tiempo Completo',
            'part_time' => 'Medio Tiempo',
            'contract' => 'Contrato',
            'freelance' => 'Freelance',
            'internship' => 'Prácticas',
        ];
    }

    private function getWorkModes(): array
    {
        return [
            'remote' => 'Remoto',
            'hybrid' => 'Híbrido',
            'on_site' => 'Presencial',
        ];
    }

    private function getExperienceLevels(): array
    {
        return [
            'entry' => 'Entrada',
            'junior' => 'Junior',
            'mid' => 'Intermedio',
            'senior' => 'Senior',
            'lead' => 'Lead',
            'principal' => 'Principal',
        ];
    }

    private function getPopularTechStack(): array
    {
        return DB::table('job_opportunities')
            ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(tech_stack, "$[*]")) as tech')
            ->where('status', 'published')
            ->groupBy('tech')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(50)
            ->pluck('tech')
            ->toArray();
    }
}
