<?php

namespace App\Http\Controllers;

use App\Models\MentorshipProgram;
use App\Models\MentorshipSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MentorshipController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only([
            'search', 'expertise_area', 'format', 'price_range', 'rating_min'
        ]);

        $programs = MentorshipProgram::query()
            ->with(['mentor'])
            ->where('is_active', true)
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereJsonContains('expertise_areas', $search)
                      ->orWhereJsonContains('technologies', $search);
                });
            })
            ->when($filters['expertise_area'] ?? null, function ($query, $area) {
                $query->whereJsonContains('expertise_areas', $area);
            })
            ->when($filters['format'] ?? null, function ($query, $format) {
                $query->where('format', $format);
            })
            ->when($filters['price_range'] ?? null, function ($query, $range) {
                match($range) {
                    'free' => $query->whereNull('price_per_session')->orWhere('price_per_session', 0),
                    'budget' => $query->whereBetween('price_per_session', [1, 50]),
                    'premium' => $query->where('price_per_session', '>', 50),
                    default => $query
                };
            })
            ->when($filters['rating_min'] ?? null, function ($query, $rating) {
                $query->where('rating', '>=', $rating);
            })
            ->orderByDesc('rating')
            ->orderByDesc('completed_programs')
            ->paginate(20);

        $popularAreas = $this->getPopularExpertiseAreas();
        $topMentors = $this->getTopMentors(6);

        return Inertia::render('Mentorship/Index', [
            'programs' => $programs,
            'filters' => $filters,
            'popularAreas' => $popularAreas,
            'topMentors' => $topMentors,
            'formats' => $this->getFormats(),
        ]);
    }

    public function show(MentorshipProgram $program)
    {
        $program->load(['mentor', 'sessions' => function ($query) {
            $query->where('mentee_id', Auth::id());
        }]);

        // Check if user is already enrolled
        $enrollment = $program->sessions()
            ->where('mentee_id', Auth::id())
            ->first();

        // Get mentor's other programs
        $otherPrograms = MentorshipProgram::where('mentor_id', $program->mentor_id)
            ->where('id', '!=', $program->id)
            ->where('is_active', true)
            ->take(3)
            ->get();

        // Get mentor's recent reviews
        $recentReviews = MentorshipSession::where('mentor_id', $program->mentor_id)
            ->whereNotNull('mentee_rating')
            ->whereNotNull('mentee_feedback')
            ->with('mentee')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Mentorship/Show', [
            'program' => $program,
            'enrollment' => $enrollment,
            'otherPrograms' => $otherPrograms,
            'recentReviews' => $recentReviews,
        ]);
    }

    public function enroll(Request $request, MentorshipProgram $program)
    {
        $request->validate([
            'goals' => 'required|array|min:1',
            'experience_level' => 'required|string',
            'availability' => 'required|array',
            'message' => 'nullable|string|max:1000',
        ]);

        // Check if already enrolled
        $existingSession = $program->sessions()
            ->where('mentee_id', Auth::id())
            ->exists();

        if ($existingSession) {
            return back()->withErrors(['error' => 'Ya estás inscrito en este programa.']);
        }

        // Create initial session
        $session = $program->sessions()->create([
            'mentor_id' => $program->mentor_id,
            'mentee_id' => Auth::id(),
            'title' => 'Sesión Inicial - ' . $program->title,
            'description' => 'Sesión de introducción y definición de objetivos',
            'scheduled_at' => null, // To be scheduled by mentor
            'duration_minutes' => $program->session_duration_minutes,
            'status' => 'scheduled',
            'goals' => $request->goals,
            'mentee_notes' => $request->message,
        ]);

        return redirect()->route('mentorship.dashboard')
            ->with('success', 'Solicitud de mentoría enviada exitosamente.');
    }

    public function dashboard()
    {
        $user = Auth::user();

        // As mentee
        $myMentorships = MentorshipSession::where('mentee_id', $user->id)
            ->with(['program', 'mentor'])
            ->orderBy('scheduled_at', 'desc')
            ->take(10)
            ->get();

        // As mentor
        $myPrograms = [];
        $myMentees = [];
        if ($user->is_mentor ?? false) {
            $myPrograms = MentorshipProgram::where('mentor_id', $user->id)
                ->withCount('sessions')
                ->get();

            $myMentees = MentorshipSession::where('mentor_id', $user->id)
                ->with(['program', 'mentee'])
                ->orderBy('scheduled_at', 'desc')
                ->take(10)
                ->get();
        }

        $stats = [
            'sessions_completed' => MentorshipSession::where('mentee_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'hours_mentored' => MentorshipSession::where('mentee_id', $user->id)
                ->where('status', 'completed')
                ->sum('duration_minutes') / 60,
            'programs_enrolled' => MentorshipSession::where('mentee_id', $user->id)
                ->distinct('program_id')
                ->count(),
        ];

        return Inertia::render('Mentorship/Dashboard', [
            'myMentorships' => $myMentorships,
            'myPrograms' => $myPrograms,
            'myMentees' => $myMentees,
            'stats' => $stats,
        ]);
    }

    public function createProgram()
    {
        return Inertia::render('Mentorship/CreateProgram', [
            'expertiseAreas' => $this->getExpertiseAreas(),
            'technologies' => $this->getPopularTechnologies(),
        ]);
    }

    public function storeProgram(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'expertise_areas' => 'required|array|min:1',
            'technologies' => 'required|array|min:1',
            'format' => 'required|in:one_on_one,group,hybrid',
            'max_mentees' => 'required|integer|min:1|max:20',
            'duration_weeks' => 'required|integer|min:1|max:52',
            'price_per_session' => 'nullable|numeric|min:0',
            'session_duration_minutes' => 'required|integer|min:30|max:180',
            'schedule_availability' => 'required|array',
            'requirements' => 'nullable|array',
            'learning_outcomes' => 'required|string',
        ]);

        $program = MentorshipProgram::create([
            'mentor_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'expertise_areas' => $request->expertise_areas,
            'technologies' => $request->technologies,
            'format' => $request->format,
            'max_mentees' => $request->max_mentees,
            'duration_weeks' => $request->duration_weeks,
            'price_per_session' => $request->price_per_session,
            'session_duration_minutes' => $request->session_duration_minutes,
            'schedule_availability' => $request->schedule_availability,
            'requirements' => $request->requirements,
            'learning_outcomes' => $request->learning_outcomes,
            'is_active' => true,
        ]);

        return redirect()->route('mentorship.show', $program)
            ->with('success', 'Programa de mentoría creado exitosamente.');
    }

    public function scheduleSession(Request $request, MentorshipSession $session)
    {
        $this->authorize('scheduleSession', $session);

        $request->validate([
            'scheduled_at' => 'required|date|after:now',
            'meeting_link' => 'required|url',
            'agenda' => 'nullable|string|max:1000',
        ]);

        $session->update([
            'scheduled_at' => $request->scheduled_at,
            'meeting_link' => $request->meeting_link,
            'description' => $request->agenda ?? $session->description,
            'status' => 'scheduled',
        ]);

        return back()->with('success', 'Sesión programada exitosamente.');
    }

    public function completeSession(Request $request, MentorshipSession $session)
    {
        $this->authorize('completeSession', $session);

        $request->validate([
            'mentor_notes' => 'required|string|max:2000',
            'homework' => 'nullable|array',
        ]);

        $session->update([
            'status' => 'completed',
            'mentor_notes' => $request->mentor_notes,
            'homework' => $request->homework,
        ]);

        return back()->with('success', 'Sesión marcada como completada.');
    }

    public function rateSession(Request $request, MentorshipSession $session)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'required|string|max:1000',
        ]);

        $user = Auth::user();
        
        if ($user->id === $session->mentee_id) {
            $session->update([
                'mentee_rating' => $request->rating,
                'mentee_feedback' => $request->feedback,
            ]);
        } elseif ($user->id === $session->mentor_id) {
            $session->update([
                'mentor_rating' => $request->rating,
                'mentor_feedback' => $request->feedback,
            ]);
        } else {
            abort(403);
        }

        // Update program rating
        $this->updateProgramRating($session->program);

        return back()->with('success', 'Calificación enviada exitosamente.');
    }

    private function updateProgramRating(MentorshipProgram $program)
    {
        $sessions = MentorshipSession::where('program_id', $program->id)
            ->whereNotNull('mentee_rating')
            ->get();

        if ($sessions->count() > 0) {
            $averageRating = $sessions->avg('mentee_rating');
            $program->update([
                'rating' => round($averageRating, 2),
                'reviews_count' => $sessions->count(),
            ]);
        }
    }

    private function getPopularExpertiseAreas(): array
    {
        return DB::table('mentorship_programs')
            ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(expertise_areas, "$[*]")) as area')
            ->where('is_active', true)
            ->groupBy('area')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(20)
            ->pluck('area')
            ->toArray();
    }

    private function getTopMentors(int $limit): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereHas('mentorshipPrograms', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount('mentorshipPrograms')
            ->orderByDesc('mentorship_programs_count')
            ->take($limit)
            ->get();
    }

    private function getFormats(): array
    {
        return [
            'one_on_one' => '1 a 1',
            'group' => 'Grupal',
            'hybrid' => 'Híbrido',
        ];
    }

    private function getExpertiseAreas(): array
    {
        return [
            'web_development' => 'Desarrollo Web',
            'mobile_development' => 'Desarrollo Móvil',
            'data_science' => 'Data Science',
            'machine_learning' => 'Machine Learning',
            'devops' => 'DevOps',
            'cybersecurity' => 'Ciberseguridad',
            'ui_ux_design' => 'UI/UX Design',
            'backend_development' => 'Backend Development',
            'frontend_development' => 'Frontend Development',
            'cloud_computing' => 'Cloud Computing',
            'blockchain' => 'Blockchain',
            'career_development' => 'Desarrollo de Carrera',
            'technical_interviews' => 'Entrevistas Técnicas',
            'leadership' => 'Liderazgo Técnico',
        ];
    }

    private function getPopularTechnologies(): array
    {
        return [
            'JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Node.js',
            'Vue.js', 'Angular', 'PHP', 'Laravel', 'Django', 'Spring Boot',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'MongoDB',
            'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST APIs',
            'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas',
        ];
    }
}