<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = User::when($request->search, function ($query, $search) {
                return $query->where('username', 'like', '%' . $search . '%')
                           ->orWhere('full_name', 'like', '%' . $search . '%');
            })
            ->when($request->level, function ($query, $level) {
                return $query->where('level', $level);
            })
            ->when($request->open_to_work, function ($query) {
                return $query->where('is_open_to_work', true);
            })
            ->latest()
            ->paginate(12);

        // Desarrolladores destacados
        $featured_developers = User::withCount('followers as followers_count_calc')
            ->orderBy('followers_count_calc', 'desc')
            ->take(10)
            ->get();

        // Nuevos miembros
        $new_members = User::latest()
            ->take(10)
            ->get();

        return Inertia::render('users', [
            'users' => $users,
            'filters' => $request->only('search', 'level', 'open_to_work'),
            'featured_developers' => $featured_developers,
            'new_members' => $new_members,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load(['posts' => function ($query) {
            $query->with(['comments.user'])->withCount('comments as comments_count_calc')->latest();
        }]);

        // Verificar si el usuario actual sigue a este usuario
        $isFollowing = Auth::check() && Auth::user()->isFollowing($user);
        $isOwnProfile = Auth::check() && Auth::id() === $user->id;

        // Estadísticas del usuario
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
        ]);
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
        Gate::authorize('update', $user);

        $request->validate([
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
            'username' => $request->username,
            'full_name' => $request->full_name,
            'bio' => $request->bio,
            'level' => $request->level,
            'years_experience' => $request->years_experience,
            'location' => $request->location,
            'website' => $request->website,
            'github_username' => $request->github_username,
            'linkedin_profile' => $request->linkedin_profile,
            'is_open_to_work' => $request->is_open_to_work ?? false,
            'avatar' => $request->avatar,
        ]);

        return redirect()->route('users.show', $user)
            ->with('success', '¡Perfil actualizado exitosamente!');
    }

    /**
     * Follow a user
     */
    public function follow(User $user)
    {
        $currentUser = Auth::user();

        if ($currentUser->id === $user->id) {
            return back()->with('error', 'No puedes seguirte a ti mismo.');
        }

        if ($currentUser->isFollowing($user)) {
            return back()->with('error', 'Ya sigues a este usuario.');
        }

        $currentUser->following()->attach($user->id);

        // Crear notificación de seguimiento
        NotificationService::userFollowed($currentUser, $user);

        return back()->with('success', '¡Ahora sigues a ' . $user->username . '!');
    }

    /**
     * Unfollow a user
     */
    public function unfollow(User $user)
    {
        $currentUser = Auth::user();

        if (!$currentUser->isFollowing($user)) {
            return back()->with('error', 'No sigues a este usuario.');
        }

        $currentUser->following()->detach($user->id);

        return back()->with('success', '¡Has dejado de seguir a ' . $user->username . '!');
    }

    /**
     * Get user's followers
     */
    public function followers(User $user)
    {
        $followers = $user->followers()->paginate(20);

        return Inertia::render('users/followers', [
            'user' => $user,
            'followers' => $followers,
        ]);
    }

    /**
     * Get user's following
     */
    public function following(User $user)
    {
        $following = $user->following()->paginate(20);

        return Inertia::render('users/following', [
            'user' => $user,
            'following' => $following,
        ]);
    }

    /**
     * Search users
     */
    public function search(Request $request)
    {
        $query = $request->query('q');

        if (empty($query)) {
            return response()->json([]);
        }

        $users = User::where('username', 'like', '%' . $query . '%')
            ->orWhere('full_name', 'like', '%' . $query . '%')
            ->limit(10)
            ->get(['id', 'username', 'full_name', 'avatar', 'level']);

        return response()->json($users);
    }

    /**
     * Get user's posts
     */
    public function posts(User $user)
    {
        $posts = $user->posts()
            ->with(['comments.user'])
            ->withCount('comments as comments_count_calc')
            ->latest()
            ->paginate(10);

        return Inertia::render('Users/Posts', [
            'user' => $user,
            'posts' => $posts,
        ]);
    }

    /**
     * Get developers looking for work
     */
    public function openToWork(Request $request)
    {
        $users = User::where('is_open_to_work', true)
            ->when($request->level, function ($query, $level) {
                return $query->where('level', $level);
            })
            ->when($request->location, function ($query, $location) {
                return $query->where('location', 'like', '%' . $location . '%');
            })
            ->latest()
            ->paginate(12);

        return Inertia::render('Users/OpenToWork', [
            'users' => $users,
            'filters' => $request->only('level', 'location'),
        ]);
    }
}
