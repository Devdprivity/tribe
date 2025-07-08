<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $request->post_id,
            'content' => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        $comment->load('user');

        // Crear notificaciones
        $user = Auth::user();
        $post = Post::find($request->post_id);

        if ($request->parent_id) {
            // Es una respuesta a un comentario
            $parentComment = Comment::find($request->parent_id);
            NotificationService::commentReplied($user, $parentComment, $comment);
        } else {
            // Es un comentario en un post
            NotificationService::postCommented($user, $post, $comment);
        }

        return back()->with('success', '¡Comentario agregado exitosamente!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Comment $comment)
    {
        $comment->load(['user', 'post', 'replies.user', 'replies.replies']);

        return response()->json($comment);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comment $comment)
    {
        Gate::authorize('update', $comment);

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update([
            'content' => $request->content,
        ]);

        return back()->with('success', '¡Comentario actualizado exitosamente!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {
        Gate::authorize('delete', $comment);

        $comment->delete();

        return back()->with('success', '¡Comentario eliminado exitosamente!');
    }

    /**
     * Get comments for a specific post
     */
    public function getByPost(Post $post)
    {
        $comments = Comment::getThreadedComments($post->id);

        return response()->json($comments);
    }

    /**
     * Get replies for a specific comment
     */
    public function getReplies(Comment $comment)
    {
        $replies = $comment->replies()->with(['user', 'replies.user'])->get();

        return response()->json($replies);
    }
}
