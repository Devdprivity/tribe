<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DirectMessageController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\StoryLikeController;

Route::get('/', function () {
    return Auth::check() ? redirect()->route('timeline.redirect') : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Timeline as main page
    Route::get('timeline', [PostController::class, 'timeline'])->name('posts.timeline');
    
    // Clear onboarding flags
    Route::post('clear-onboarding-flags', function () {
        session()->forget(['force_onboarding', 'clear_onboarding_storage']);
        return response()->json(['success' => true]);
    })->name('clear.onboarding.flags');
    
    // Test onboarding flow (only in development)
    if (app()->environment('local')) {
        Route::get('test-onboarding', function () {
            return response()->file(base_path('test-onboarding-flow.html'));
        })->name('test.onboarding');
    }

    // Posts Routes
    Route::resource('posts', PostController::class);
    Route::post('posts/{post}/like', [PostController::class, 'toggleLike'])->name('posts.like');
    Route::post('posts/{post}/pin', [PostController::class, 'togglePin'])->name('posts.pin');
    Route::get('hashtag/{hashtag}', [PostController::class, 'byHashtag'])->name('posts.hashtag');

    // Channels Routes
    Route::resource('channels', ChannelController::class);
    Route::post('channels/{channel}/join', [ChannelController::class, 'join'])->name('channels.join');
    Route::post('channels/{channel}/leave', [ChannelController::class, 'leave'])->name('channels.leave');
    Route::post('channels/{channel}/invite', [ChannelController::class, 'inviteUser'])->name('channels.invite');
    Route::delete('channels/{channel}/remove', [ChannelController::class, 'removeUser'])->name('channels.remove');
    Route::patch('channels/{channel}/role', [ChannelController::class, 'updateUserRole'])->name('channels.role');
    Route::get('channels/{channel}/members', [ChannelController::class, 'members'])->name('channels.members');
    Route::get('api/channels/search', [ChannelController::class, 'search'])->name('channels.search');
    Route::get('api/channels/favorites', [ChannelController::class, 'favorites'])->name('channels.favorites');

    // Jobs Routes
    Route::get('my-applications', [JobController::class, 'myApplications'])->name('jobs.my-applications');
    Route::get('my-jobs', [JobController::class, 'myJobs'])->name('jobs.my-jobs');
    Route::resource('jobs', JobController::class);
    Route::post('jobs/{job}/apply', [JobController::class, 'apply'])->name('jobs.apply');
    Route::get('jobs/{job}/applications', [JobController::class, 'applications'])->name('jobs.applications');
    Route::patch('jobs/{job}/applications/{application}', [JobController::class, 'updateApplicationStatus'])->name('jobs.application.status');
    Route::post('jobs/{job}/toggle-active', [JobController::class, 'toggleActive'])->name('jobs.toggle-active');

    // Comments Routes
    Route::resource('comments', CommentController::class)->only(['store', 'show', 'update', 'destroy']);
    Route::get('posts/{post}/comments', [CommentController::class, 'getByPost'])->name('comments.by-post');
    Route::get('comments/{comment}/replies', [CommentController::class, 'getReplies'])->name('comments.replies');
    Route::post('comments/{comment}/like', [CommentController::class, 'toggleLike'])->name('comments.like');
    Route::get('api/posts/{post}/comments', [CommentController::class, 'getByPost'])->name('api.comments.by-post');
    Route::post('api/comments', [CommentController::class, 'store'])->name('api.comments.store');

    // Users Routes
    Route::resource('users', UserController::class)->only(['index', 'show', 'edit', 'update']);
    Route::post('users/{user}/follow', [UserController::class, 'follow'])->name('users.follow');
    Route::delete('users/{user}/unfollow', [UserController::class, 'unfollow'])->name('users.unfollow');
    Route::get('users/{user}/followers', [UserController::class, 'followers'])->name('users.followers');
    Route::get('users/{user}/following', [UserController::class, 'following'])->name('users.following');
    Route::get('users/{user}/posts', [UserController::class, 'posts'])->name('users.posts');
    Route::get('api/users/search', [UserController::class, 'search'])->name('users.search');
    Route::get('developers/open-to-work', [UserController::class, 'openToWork'])->name('users.open-to-work');

    // Notifications Routes
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('api/notifications/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('notifications/read', [NotificationController::class, 'destroyRead'])->name('notifications.destroy-read');

    // Direct Messages Routes
    Route::get('messages', [DirectMessageController::class, 'index'])->name('messages.index');
    Route::get('messages/{user}', [DirectMessageController::class, 'show'])->name('messages.show');
    Route::post('messages', [DirectMessageController::class, 'store'])->name('messages.store');
    Route::patch('messages/{message}/read', [DirectMessageController::class, 'markAsRead'])->name('messages.read');
    Route::get('api/messages/unread', [DirectMessageController::class, 'unread'])->name('messages.unread');
    Route::get('api/messages/conversations', [DirectMessageController::class, 'conversations'])->name('messages.conversations');

    // Bookmarks Routes
    Route::get('bookmarks', [BookmarkController::class, 'index'])->name('bookmarks.index');
    Route::post('bookmarks/posts/{post}', [BookmarkController::class, 'togglePost'])->name('bookmarks.toggle-post');
    Route::post('bookmarks/jobs/{job}', [BookmarkController::class, 'toggleJob'])->name('bookmarks.toggle-job');
    Route::post('bookmarks/users/{user}', [BookmarkController::class, 'toggleUser'])->name('bookmarks.toggle-user');

    // Stories Routes
    Route::get('api/stories', [StoryController::class, 'index'])->name('stories.index');
    Route::post('stories', [StoryController::class, 'store'])->name('stories.store');
    Route::get('stories/{userId}', [StoryController::class, 'show'])->name('stories.show');
    Route::delete('stories/{story}', [StoryController::class, 'destroy'])->name('stories.destroy');
    Route::post('stories/cleanup', [StoryController::class, 'cleanup'])->name('stories.cleanup');
    
    // Story Likes Routes
    Route::post('stories/{story}/like', [StoryLikeController::class, 'toggleLike'])->name('stories.like');
    Route::get('stories/{story}/like-status', [StoryLikeController::class, 'getLikeStatus'])->name('stories.like-status');

    // User Theme Preference Route
    Route::patch('user/theme-preference', [UserController::class, 'updateThemePreference'])->name('user.theme-preference');
});

// Redirect unauthenticated users to login for main routes
Route::middleware(['web'])->group(function () {
    Route::get('posts', function () {
        return Auth::check() ? app(PostController::class)->index(request()) : redirect()->route('login');
    })->name('posts.index');

    Route::get('channels', function () {
        return Auth::check() ? app(ChannelController::class)->index(request()) : redirect()->route('login');
    })->name('channels.index');

    Route::get('jobs', function () {
        return Auth::check() ? app(JobController::class)->index(request()) : redirect()->route('login');
    })->name('jobs.index');

    Route::get('users', function () {
        return Auth::check() ? app(UserController::class)->index(request()) : redirect()->route('login');
    })->name('users.index');

    Route::get('timeline', function () {
        return Auth::check() ? app(PostController::class)->timeline(request()) : redirect()->route('login');
    })->name('timeline.redirect');
});

// Public individual routes (these can be viewed without authentication)
Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
Route::get('channels/{channel}', [ChannelController::class, 'show'])->name('channels.show');
Route::get('jobs/{job}', [JobController::class, 'show'])->name('jobs.show');
Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
