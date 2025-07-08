<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class JobController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $jobs = Job::with(['poster'])
            ->active()
            ->when($request->search, function ($query, $search) {
                return $query->search($search);
            })
            ->when($request->remote, function ($query) {
                return $query->remote();
            })
            ->when($request->location, function ($query, $location) {
                return $query->inLocation($location);
            })
            ->latest()
            ->paginate(10);

        // Trabajos destacados
        $featured_jobs = Job::with('poster')
            ->where('is_active', true)
            ->orderBy('applications_count', 'desc')
            ->take(5)
            ->get();

        // Aplicaciones recientes del usuario
        $recent_applications = [];
        if (Auth::check()) {
            $recent_applications = Job::with('poster')
                ->whereHas('applications', function ($q) {
                    $q->where('user_id', Auth::id());
                })
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();
        }

        return Inertia::render('jobs', [
            'jobs' => $jobs,
            'filters' => $request->only('search', 'remote', 'location'),
            'featured_jobs' => $featured_jobs,
            'recent_applications' => $recent_applications,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('jobs/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|array',
            'salary_range' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'remote_friendly' => 'boolean',
        ]);

        $job = Job::create([
            'company_name' => $request->company_name,
            'title' => $request->title,
            'description' => $request->description,
            'requirements' => $request->requirements,
            'salary_range' => $request->salary_range,
            'location' => $request->location,
            'remote_friendly' => $request->remote_friendly ?? false,
            'posted_by' => Auth::id(),
        ]);

        return redirect()->route('jobs.show', $job)
            ->with('success', '¡Trabajo publicado exitosamente!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Job $job)
    {
        $job->load(['poster', 'applications.user']);

        // Verificar si el usuario ya aplicó
        $hasApplied = false;
        $userApplication = null;

        if (Auth::check()) {
            $userApplication = $job->getApplicationFor(Auth::user());
            $hasApplied = $userApplication !== null;
        }

        return Inertia::render('jobs/show', [
            'job' => $job,
            'hasApplied' => $hasApplied,
            'userApplication' => $userApplication,
            'canEdit' => Auth::check() && $job->posted_by === Auth::id(),
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

    /**
     * Apply to a job
     */
    public function apply(Request $request, Job $job)
    {
        $request->validate([
            'cover_letter' => 'nullable|string|max:2000',
            'resume_url' => 'nullable|url',
        ]);

        $user = Auth::user();

        if ($job->hasApplicant($user)) {
            return back()->with('error', 'Ya has aplicado a este trabajo.');
        }

        if ($job->posted_by === $user->id) {
            return back()->with('error', 'No puedes aplicar a tu propio trabajo.');
        }

        JobApplication::create([
            'job_id' => $job->id,
            'user_id' => $user->id,
            'cover_letter' => $request->cover_letter,
            'resume_url' => $request->resume_url,
        ]);

        return back()->with('success', '¡Aplicación enviada exitosamente!');
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

    /**
     * Get user's applied jobs
     */
    public function myApplications(Request $request)
    {
        $applications = JobApplication::with(['job.poster'])
            ->where('user_id', Auth::id())
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('jobs/my-applications', [
            'applications' => $applications,
            'filters' => $request->only('status'),
        ]);
    }

    /**
     * Get user's posted jobs
     */
    public function myJobs(Request $request)
    {
        $jobs = Job::with(['applications.user'])
            ->where('posted_by', Auth::id())
            ->when($request->status, function ($query, $status) {
                if ($status === 'active') {
                    return $query->active();
                } elseif ($status === 'inactive') {
                    return $query->inactive();
                }
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('jobs/my-jobs', [
            'jobs' => $jobs,
            'filters' => $request->only('status'),
        ]);
    }
}
