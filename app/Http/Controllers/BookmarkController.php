<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    /**
     * Mostrar favoritos del usuario
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Obtener posts favoritos
        $bookmarkedPosts = $user->bookmarkedPosts()
            ->with(['user', 'likes', 'comments'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Obtener trabajos favoritos
        $bookmarkedJobs = $user->bookmarkedJobs()
            ->orderBy('created_at', 'desc')
            ->get();

        // Obtener usuarios favoritos
        $bookmarkedUsers = $user->bookmarkedUsers()
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('bookmarks', [
            'bookmarkedPosts' => $bookmarkedPosts,
            'bookmarkedJobs' => $bookmarkedJobs,
            'bookmarkedUsers' => $bookmarkedUsers
        ]);
    }

    /**
     * Agregar/quitar post de favoritos
     */
    public function togglePost(Post $post): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if ($user->bookmarkedPosts()->where('post_id', $post->id)->exists()) {
            $user->bookmarkedPosts()->detach($post->id);
            $isBookmarked = false;
        } else {
            $user->bookmarkedPosts()->attach($post->id);
            $isBookmarked = true;
        }

        return response()->json([
            'success' => true,
            'is_bookmarked' => $isBookmarked
        ]);
    }

    /**
     * Agregar/quitar trabajo de favoritos
     */
    public function toggleJob(Job $job): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if ($user->bookmarkedJobs()->where('job_id', $job->id)->exists()) {
            $user->bookmarkedJobs()->detach($job->id);
            $isBookmarked = false;
        } else {
            $user->bookmarkedJobs()->attach($job->id);
            $isBookmarked = true;
        }

        return response()->json([
            'success' => true,
            'is_bookmarked' => $isBookmarked
        ]);
    }

    /**
     * Agregar/quitar usuario de favoritos
     */
    public function toggleUser(User $userToBookmark): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if ($user->bookmarkedUsers()->where('bookmarked_user_id', $userToBookmark->id)->exists()) {
            $user->bookmarkedUsers()->detach($userToBookmark->id);
            $isBookmarked = false;
        } else {
            $user->bookmarkedUsers()->attach($userToBookmark->id);
            $isBookmarked = true;
        }

        return response()->json([
            'success' => true,
            'is_bookmarked' => $isBookmarked
        ]);
    }
}
