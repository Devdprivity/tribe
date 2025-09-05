<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Exception;

class UserController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $users = User::when($request->search, function ($query, $search) {
                    return $query->where('username', 'like', '%' . $search . '%')
                               ->orWhere('full_name', 'like', '%' . $search . '%');
                })
                ->when($request->level, fn($query, $level) => $query->where('level', $level))
                ->when($request->open_to_work, fn($query) => $query->where('is_open_to_work', true))
                ->latest()
                ->paginate(12);

            $featured_developers = User::withCount('followers as followers_count_calc')
                ->orderBy('followers_count_calc', 'desc')
                ->take(10)
                ->get();

            $new_members = User::latest()
                ->take(10)
                ->get();

            return Inertia::render('users', [
                'users' => $users,
                'filters' => $request->only('search', 'level', 'open_to_work'),
                'featured_developers' => $featured_developers,
                'new_members' => $new_members,
            ]);
        } catch (Exception $e) {
            Log::error('Error loading users index', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return Inertia::render('users', [
                'users' => collect(),
                'filters' => $request->only('search', 'level', 'open_to_work'),
                'featured_developers' => collect(),
                'new_members' => collect(),
            ])->with('error', 'Error al cargar los usuarios. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        try {
            $user->load(['posts' => function ($query) {
                $query->with(['comments.user'])->withCount('comments as comments_count_calc')->latest();
            }]);

            $isFollowing = Auth::check() && Auth::user()->isFollowing($user);
            $isOwnProfile = Auth::check() && Auth::id() === $user->id;

            $stats = [
                'posts_count' => $user->posts()->count(),
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
                'channels_count' => $user->channels()->count(),
            ];

            return Inertia::render('users/show', [
                'user' => $user,
                'posts' => $user->posts,
                'followers' => $user->followers()->take(10)->get(),
                'following' => $user->following()->take(10)->get(),
                'isFollowing' => $isFollowing,
                'isOwnProfile' => $isOwnProfile,
                'stats' => $stats,
            ]);
        } catch (Exception $e) {
            Log::error('Error loading user profile', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            
            return redirect()->route('users.index')
                ->with('error', 'Error al cargar el perfil del usuario.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        Gate::authorize('update', $user);

        return Inertia::render('users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        try {
            Gate::authorize('update', $user);

            $validated = $request->validate([
                'username' => 'required|string|max:255|unique:users,username,' . $user->id,
                'full_name' => 'required|string|max:255',
                'bio' => 'nullable|string|max:1000',
                'level' => 'required|in:junior,mid,senior,lead',
                'years_experience' => 'required|integer|min:0|max:50',
                'location' => 'nullable|string|max:255',
                'website' => 'nullable|url',
                'github_username' => 'nullable|string|max:255',
                'linkedin_profile' => 'nullable|url',
                'is_open_to_work' => 'boolean',
                'avatar' => 'nullable|url',
            ]);

            $user->update([
                'username' => $validated['username'],
                'full_name' => $validated['full_name'],
                'bio' => $validated['bio'] ?? null,
                'level' => $validated['level'],
                'years_experience' => $validated['years_experience'],
                'location' => $validated['location'] ?? null,
                'website' => $validated['website'] ?? null,
                'github_username' => $validated['github_username'] ?? null,
                'linkedin_profile' => $validated['linkedin_profile'] ?? null,
                'is_open_to_work' => $validated['is_open_to_work'] ?? false,
                'avatar' => $validated['avatar'] ?? null,
            ]);

            return redirect()->route('users.show', $user)
                ->with('success', 'Perfil actualizado exitosamente');

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput()
                ->with('error', 'Por favor, corrige los errores en el formulario.');
        } catch (Exception $e) {
            Log::error('Error updating user profile', [
                'user_id' => $user->id,
                'auth_user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return back()
                ->withInput()
                ->with('error', 'Error al actualizar el perfil. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Follow a user
     */
    public function follow(User $user)
    {
        try {
            $currentUser = Auth::user();

            if ($currentUser->id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes seguirte a ti mismo.'
                ], 400);
            }

            if ($currentUser->isFollowing($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya sigues a este usuario.'
                ], 400);
            }

            DB::beginTransaction();

            $currentUser->following()->attach($user->id);
            $this->notificationService->userFollowed($currentUser, $user);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ahora sigues a ' . $user->username,
                'isFollowing' => true
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error following user', [
                'current_user_id' => Auth::id(),
                'target_user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al seguir al usuario. Inténtalo de nuevo.'
            ], 500);
        }
    }

    /**
     * Unfollow a user
     */
    public function unfollow(User $user)
    {
        try {
            $currentUser = Auth::user();

            if (!$currentUser->isFollowing($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No sigues a este usuario.'
                ], 400);
            }

            $currentUser->following()->detach($user->id);

            return response()->json([
                'success' => true,
                'message' => 'Has dejado de seguir a ' . $user->username,
                'isFollowing' => false
            ]);

        } catch (Exception $e) {
            Log::error('Error unfollowing user', [
                'current_user_id' => Auth::id(),
                'target_user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al dejar de seguir al usuario. Inténtalo de nuevo.'
            ], 500);
        }
    }

    /**
     * Get user's followers
     */
    public function followers(User $user)
    {
        try {
            $followers = $user->followers()->paginate(20);

            return Inertia::render('users/followers', [
                'user' => $user,
                'followers' => $followers,
            ]);
        } catch (Exception $e) {
            Log::error('Error loading user followers', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            
            return redirect()->route('users.show', $user)
                ->with('error', 'Error al cargar los seguidores.');
        }
    }

    /**
     * Get user's following
     */
    public function following(User $user)
    {
        try {
            $following = $user->following()->paginate(20);

            return Inertia::render('users/following', [
                'user' => $user,
                'following' => $following,
            ]);
        } catch (Exception $e) {
            Log::error('Error loading user following', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            
            return redirect()->route('users.show', $user)
                ->with('error', 'Error al cargar los usuarios seguidos.');
        }
    }

    /**
     * Search users
     */
    public function search(Request $request)
    {
        try {
            $query = trim($request->query('q'));

            if (empty($query) || strlen($query) < 2) {
                return response()->json([]);
            }

            $users = User::where('username', 'like', '%' . $query . '%')
                ->orWhere('full_name', 'like', '%' . $query . '%')
                ->limit(10)
                ->get(['id', 'username', 'full_name', 'avatar', 'level']);

            return response()->json($users);
        } catch (Exception $e) {
            Log::error('Error searching users', [
                'query' => $request->query('q'),
                'error' => $e->getMessage()
            ]);

            return response()->json([], 500);
        }
    }

    /**
     * Get user's posts
     */
    public function posts(User $user)
    {
        try {
            $posts = $user->posts()
                ->with(['comments.user'])
                ->withCount('comments as comments_count_calc')
                ->latest()
                ->paginate(10);

            return Inertia::render('Users/Posts', [
                'user' => $user,
                'posts' => $posts,
            ]);
        } catch (Exception $e) {
            Log::error('Error loading user posts', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            
            return Inertia::render('Users/Posts', [
                'user' => $user,
                'posts' => collect(),
            ])->with('error', 'Error al cargar los posts del usuario.');
        }
    }

    /**
     * Get developers looking for work
     */
    public function openToWork(Request $request)
    {
        try {
            $users = User::where('is_open_to_work', true)
                ->when($request->level, fn($query, $level) => $query->where('level', $level))
                ->when($request->location, fn($query, $location) => $query->where('location', 'like', '%' . $location . '%'))
                ->latest()
                ->paginate(12);

            return Inertia::render('Users/OpenToWork', [
                'users' => $users,
                'filters' => $request->only('level', 'location'),
            ]);
        } catch (Exception $e) {
            Log::error('Error loading open to work users', ['error' => $e->getMessage()]);
            
            return Inertia::render('Users/OpenToWork', [
                'users' => collect(),
                'filters' => $request->only('level', 'location'),
            ])->with('error', 'Error al cargar los desarrolladores disponibles.');
        }
    }

    /**
     * Update user theme preference
     */
    public function updateThemePreference(Request $request)
    {
        try {
            $validated = $request->validate([
                'theme_preference' => 'required|in:light,dark,system',
            ]);

            $user = Auth::user();
            $user->update([
                'theme_preference' => $validated['theme_preference'],
            ]);

            return response()->json([
                'success' => true,
                'theme_preference' => $user->theme_preference,
                'message' => 'Tema actualizado exitosamente'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tema no válido',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Error updating theme preference', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el tema. Inténtalo de nuevo.'
            ], 500);
        }
    }
}
