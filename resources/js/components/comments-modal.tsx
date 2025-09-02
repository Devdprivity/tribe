import React, { useState, useEffect, useRef } from 'react';
import { formatTimeAgo } from '@/utils/time-format';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
    X, 
    Heart, 
    MessageCircle, 
    Share2, 
    Smile, 
    Camera, 
    Paperclip,
    Send,
    MoreHorizontal
} from 'lucide-react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: User;
    likes_count: number;
    replies_count: number;
    user_liked: boolean;
}

interface Post {
    id: number;
    content: string;
    type: 'text' | 'image' | 'video' | 'code' | 'project';
    media_urls?: string[];
    likes_count: number;
    comments_count: number;
    shares_count: number;
    created_at: string;
    user: User;
    user_liked: boolean;
    hashtags?: string[];
}

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    currentUser: User;
}

export default function CommentsModal({ isOpen, onClose, post, currentUser }: CommentsModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchComments();
            // Focus en el input después de un pequeño delay
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen, post.id]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/posts/${post.id}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    post_id: post.id,
                    content: newComment.trim(),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments(prev => [...prev, data.comment]);
                setNewComment('');
                // Scroll to bottom
                setTimeout(() => {
                    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };



    const getPostTypeIcon = (type: string) => {
        switch (type) {
            case 'image': return '🖼️';
            case 'video': return '🎥';
            case 'code': return '💻';
            case 'project': return '🚀';
            default: return '📝';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
            <div 
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg max-w-2xl w-full mx-4 h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white text-lg font-semibold">
                            Comentarios de {post.user.full_name}
                        </h2>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Post Content */}
                <div className="p-4 border-b border-white/10">
                    {/* User info */}
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                                {post.user.full_name?.charAt(0) || post.user.username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium text-sm">{post.user.full_name}</span>
                                <span className="text-white/50 text-xs">@{post.user.username}</span>
                                <span className="text-white/30 text-xs">•</span>
                                <span className="text-white/30 text-xs">{formatTimeAgo(post.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Post content */}
                    <div className="mb-3">
                        <p className="text-white text-sm leading-relaxed">{post.content}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {post.hashtags.map((tag, index) => (
                                    <span key={index} className="text-blue-400 text-xs">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Media */}
                    {post.media_urls && post.media_urls.length > 0 && (
                        <div className="mb-3">
                            {post.type === 'image' ? (
                                <img 
                                    src={post.media_urls[0]} 
                                    alt="Post media" 
                                    className="w-full max-h-48 object-cover rounded-lg"
                                />
                            ) : post.type === 'video' ? (
                                <video 
                                    src={post.media_urls[0]} 
                                    controls 
                                    className="w-full max-h-48 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                                    <span className="text-2xl">{getPostTypeIcon(post.type)}</span>
                                    <div>
                                        <p className="text-white font-medium">{post.type.charAt(0).toUpperCase() + post.type.slice(1)}</p>
                                        <p className="text-white/50 text-sm">Archivo adjunto</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reactions and share */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Heart className={`h-4 w-4 ${post.user_liked ? 'text-red-500 fill-red-500' : 'text-white/50'}`} />
                                <span className="text-white/70 text-sm">{post.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4 text-white/50" />
                                <span className="text-white/70 text-sm">{post.comments_count}</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/50 hover:text-white hover:bg-white/10"
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                                        <div className="h-3 bg-white/10 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.user.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                                        {comment.user.full_name?.charAt(0) || comment.user.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-medium text-sm">{comment.user.full_name}</span>
                                        <span className="text-white/50 text-xs">@{comment.user.username}</span>
                                        <span className="text-white/30 text-xs">•</span>
                                        <span className="text-white/30 text-xs">{formatTimeAgo(comment.created_at)}</span>
                                    </div>
                                    <p className="text-white/90 text-sm leading-relaxed">{comment.content}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-white/50 hover:text-white hover:bg-white/10 h-6 px-2"
                                        >
                                            <Heart className="h-3 w-3 mr-1" />
                                            <span className="text-xs">{comment.likes_count}</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-white/50 hover:text-white hover:bg-white/10 h-6 px-2"
                                        >
                                            <MessageCircle className="h-3 w-3 mr-1" />
                                            <span className="text-xs">{comment.replies_count}</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/50 text-sm">No hay comentarios aún</p>
                            <p className="text-white/30 text-xs">Sé el primero en comentar</p>
                        </div>
                    )}
                    <div ref={commentsEndRef} />
                </div>

                {/* Comment Input - Sticky Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <form onSubmit={handleSubmitComment} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                                {currentUser.full_name?.charAt(0) || currentUser.username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={`Comentar como ${currentUser.full_name}`}
                                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 text-sm"
                                disabled={isSubmitting}
                            />
                            
                            {/* Action icons */}
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/50 hover:text-white hover:bg-white/10 rounded-full w-6 h-6 p-0"
                                >
                                    <Smile className="h-3 w-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/50 hover:text-white hover:bg-white/10 rounded-full w-6 h-6 p-0"
                                >
                                    <Camera className="h-3 w-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/50 hover:text-white hover:bg-white/10 rounded-full w-6 h-6 p-0"
                                >
                                    <Paperclip className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        
                        <Button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="bg-blue-500/80 hover:bg-blue-500 text-white rounded-full w-8 h-8 p-0 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
