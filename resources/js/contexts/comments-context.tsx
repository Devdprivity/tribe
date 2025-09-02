import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
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

interface CommentsContextType {
    isCommentsModalOpen: boolean;
    selectedPost: Post | null;
    openCommentsModal: (post: Post) => void;
    closeCommentsModal: () => void;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export function CommentsProvider({ children }: { children: ReactNode }) {
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const openCommentsModal = (post: Post) => {
        setSelectedPost(post);
        setIsCommentsModalOpen(true);
    };

    const closeCommentsModal = () => {
        setIsCommentsModalOpen(false);
        setSelectedPost(null);
    };

    return (
        <CommentsContext.Provider
            value={{
                isCommentsModalOpen,
                selectedPost,
                openCommentsModal,
                closeCommentsModal,
            }}
        >
            {children}
        </CommentsContext.Provider>
    );
}

export function useComments() {
    const context = useContext(CommentsContext);
    if (context === undefined) {
        throw new Error('useComments must be used within a CommentsProvider');
    }
    return context;
}
