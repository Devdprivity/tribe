<?php

namespace App\Policies;

use App\Models\LiveStream;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LiveStreamPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LiveStream $liveStream): bool
    {
        // Public streams can be viewed by anyone
        if ($liveStream->privacy === 'public') {
            return true;
        }

        // Unlisted streams can be viewed by anyone with the link
        if ($liveStream->privacy === 'unlisted') {
            return true;
        }

        // Private streams can only be viewed by the owner
        if ($liveStream->privacy === 'private') {
            return $user->id === $liveStream->streamer_id;
        }

        // Subscriber-only streams require an active subscription
        if ($liveStream->subscribers_only) {
            return $liveStream->streamer->subscribers()
                ->where('subscriber_id', $user->id)
                ->where('status', 'active')
                ->exists();
        }

        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, LiveStream $liveStream): bool
    {
        return $user->id === $liveStream->streamer_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LiveStream $liveStream): bool
    {
        return $user->id === $liveStream->streamer_id;
    }

    /**
     * Determine whether the user can manage the stream (start, end, etc.)
     */
    public function manage(User $user, LiveStream $liveStream): bool
    {
        return $user->id === $liveStream->streamer_id;
    }

    /**
     * Determine whether the user can start the stream.
     */
    public function start(User $user, LiveStream $liveStream): bool
    {
        return $user->id === $liveStream->streamer_id && $liveStream->status === 'scheduled';
    }

    /**
     * Determine whether the user can end the stream.
     */
    public function end(User $user, LiveStream $liveStream): bool
    {
        return $user->id === $liveStream->streamer_id && $liveStream->status === 'live';
    }

    /**
     * Determine whether the user can join the stream.
     */
    public function join(User $user, LiveStream $liveStream): bool
    {
        return $liveStream->canUserJoin($user);
    }

    /**
     * Determine whether the user can moderate the stream (ban users, delete messages, etc.)
     */
    public function moderate(User $user, LiveStream $liveStream): bool
    {
        return $user->id === $liveStream->streamer_id;
    }
}