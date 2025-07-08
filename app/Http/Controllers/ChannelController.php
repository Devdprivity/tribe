<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Post;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ChannelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $channels = Channel::with(['creator', 'members'])
            ->withCount('members as members_count_calc')
            ->when($request->type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->when($request->search, function ($query, $search) {
                return $query->search($search);
            })
            ->when($request->my_channels, function ($query) {
                return $query->whereHas('members', function ($q) {
                    $q->where('user_id', Auth::id());
                });
            })
            ->public()
            ->latest()
            ->paginate(12);

        // Obtener canales del usuario autenticado
        $my_channels = [];
        if (Auth::check()) {
            $my_channels = Channel::whereHas('members', function ($q) {
                $q->where('user_id', Auth::id());
            })->get();
        }

        // Canales trending
        $trending_channels = Channel::withCount('members as members_count_calc')
            ->orderBy('members_count_calc', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('channels', [
            'channels' => $channels,
            'filters' => $request->only('type', 'search', 'my_channels'),
            'my_channels' => $my_channels,
            'trending_channels' => $trending_channels,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('channels/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:technology,level,industry,location',
            'avatar' => 'nullable|url',
            'is_private' => 'boolean',
        ]);

        $channel = Channel::create([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'avatar' => $request->avatar,
            'is_private' => $request->is_private ?? false,
            'created_by' => Auth::id(),
        ]);

        // Automáticamente agregar al creador como admin
        $channel->addMember(Auth::user(), 'admin');

        return redirect()->route('channels.show', $channel)
            ->with('success', '¡Canal creado exitosamente!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Channel $channel)
    {
        // Verificar si el usuario puede ver el canal
        if ($channel->is_private && Auth::guest()) {
            abort(403, 'Este canal es privado.');
        }

        if ($channel->is_private && !$channel->hasMember(Auth::user())) {
            abort(403, 'No tienes acceso a este canal privado.');
        }

        $channel->load(['creator', 'members']);

        // Posts del canal
        $posts = Post::with(['user', 'comments.user'])
            ->withCount('comments as comments_count_calc')
            ->where('channel_id', $channel->id)
            ->latest()
            ->paginate(10);

        // Verificar si el usuario es miembro
        $isMember = Auth::check() && $channel->hasMember(Auth::user());
        $memberRole = null;

        if ($isMember) {
            $membership = $channel->members()->where('user_id', Auth::id())->first();
            $memberRole = $membership ? $membership->pivot->role : null;
        }

        return Inertia::render('channels/show', [
            'channel' => $channel,
            'posts' => $posts,
            'isMember' => $isMember,
            'memberRole' => $memberRole,
            'canModerate' => Auth::check() && $channel->canModerate(Auth::user()),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Channel $channel)
    {
        Gate::authorize('update', $channel);

        return Inertia::render('channels/edit', [
            'channel' => $channel,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Channel $channel)
    {
        Gate::authorize('update', $channel);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:technology,level,industry,location',
            'avatar' => 'nullable|url',
            'is_private' => 'boolean',
        ]);

        $channel->update([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'avatar' => $request->avatar,
            'is_private' => $request->is_private ?? false,
        ]);

        return redirect()->route('channels.show', $channel)
            ->with('success', '¡Canal actualizado exitosamente!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Channel $channel)
    {
        Gate::authorize('delete', $channel);

        $channel->delete();

        return redirect()->route('channels.index')
            ->with('success', '¡Canal eliminado exitosamente!');
    }

    /**
     * Join a channel
     */
    public function join(Channel $channel)
    {
        $user = Auth::user();

        if ($channel->is_private) {
            abort(403, 'No puedes unirte a un canal privado sin invitación.');
        }

        if ($channel->hasMember($user)) {
            return back()->with('error', 'Ya eres miembro de este canal.');
        }

        $channel->addMember($user);

        // Crear notificación de unión al canal
        NotificationService::channelJoined($user, $channel);

        return back()->with('success', '¡Te has unido al canal exitosamente!');
    }

    /**
     * Leave a channel
     */
    public function leave(Channel $channel)
    {
        $user = Auth::user();

        if (!$channel->hasMember($user)) {
            return back()->with('error', 'No eres miembro de este canal.');
        }

        // El creador no puede abandonar el canal
        if ($channel->created_by === $user->id) {
            return back()->with('error', 'El creador del canal no puede abandonarlo.');
        }

        $channel->removeMember($user);

        return back()->with('success', '¡Has abandonado el canal exitosamente!');
    }

    /**
     * Invite user to private channel
     */
    public function inviteUser(Request $request, Channel $channel)
    {
        Gate::authorize('moderate', $channel);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:member,moderator,admin',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($channel->hasMember($user)) {
            return back()->with('error', 'El usuario ya es miembro del canal.');
        }

        $channel->addMember($user, $request->role);

        return back()->with('success', '¡Usuario invitado exitosamente!');
    }

    /**
     * Remove user from channel
     */
    public function removeUser(Request $request, Channel $channel)
    {
        Gate::authorize('moderate', $channel);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        if (!$channel->hasMember($user)) {
            return back()->with('error', 'El usuario no es miembro del canal.');
        }

        // No puede remover al creador del canal
        if ($channel->created_by === $user->id) {
            return back()->with('error', 'No puedes remover al creador del canal.');
        }

        $channel->removeMember($user);

        return back()->with('success', '¡Usuario removido del canal exitosamente!');
    }

    /**
     * Update user role in channel
     */
    public function updateUserRole(Request $request, Channel $channel)
    {
        Gate::authorize('moderate', $channel);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:member,moderator,admin',
        ]);

        $user = User::findOrFail($request->user_id);

        if (!$channel->hasMember($user)) {
            return back()->with('error', 'El usuario no es miembro del canal.');
        }

        $channel->updateMemberRole($user, $request->role);

        return back()->with('success', '¡Rol del usuario actualizado exitosamente!');
    }

    /**
     * Get channel members
     */
    public function members(Channel $channel)
    {
        Gate::authorize('view', $channel);

        $members = $channel->members()->with(['user'])->paginate(20);

        return Inertia::render('channels/members', [
            'channel' => $channel,
            'members' => $members,
        ]);
    }

    /**
     * Search channels
     */
    public function search(Request $request)
    {
        $query = $request->query('q');

        if (empty($query)) {
            return response()->json([]);
        }

        $channels = Channel::search($query)
            ->public()
            ->with(['creator'])
            ->withCount('members as members_count_calc')
            ->limit(10)
            ->get();

        return response()->json($channels);
    }
}
